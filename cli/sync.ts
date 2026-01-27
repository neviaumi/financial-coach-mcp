import { APP_ENABLED_REQUESITIONS } from "@/config.ts";
import {
  getStableStatementStartDate,
  getStatementMonthRange,
} from "@app/bank-statement/date";

import {
  dateFromYearMonthCode,
  toYearMonthCode,
} from "@app/bank-statement/year-month-code";
import {
  Credentials,
  getAccessToken,
  initializeAccessToken,
} from "@/open-banking/token.ts";
import { initializeCache } from "@/utils/cache.ts";
import { createRequisitionsRequestAgent } from "@/open-banking/requisitions.ts";
import type { Transaction } from "@app/open-banking/types";
import { type InstitutionID } from "@app/open-banking/institutions";
import {
  createAgreementsRequestAgent,
  isAgreementExpired,
} from "@/open-banking/agreements.ts";

import {
  createAccountsRequestAgent,
  findBalance,
  getAccountNumber,
  getAccountSortCode,
  getAccountType,
  isCreditCardAccount,
} from "@/open-banking/accounts.ts";
import {
  asStatement,
  fromTransactions,
  saveTransactionsAsMonthlyStatement,
  withBalance,
  withPeriod,
} from "@app/bank-statement";
if (Deno.args.length < 1) {
  throw new Error("use [yearMonthCode|now]");
}
const [yearMonthCodeInput] = Deno.args;

await using cache = await initializeCache();
function withThirtyTwoDayCache(key: string) {
  return cache.withCache(key, {
    expireAt: Temporal.Now.plainDateTimeISO().add({
      days: 32,
    }),
  });
}

const { refresh } = await cache.withCache(
  "REFRESH_TOKEN",
  (creds: Credentials) => {
    return {
      expireAt: Temporal.Instant.fromEpochMilliseconds(
        new Date().getTime() + (creds.refresh_expires * 1000),
      ).toZonedDateTimeISO("UTC").toPlainDateTime(),
    };
  },
)(initializeAccessToken)();
const accessToken: string = await getAccessToken(refresh);
const today = Temporal.Now.plainDateISO();
const { startDate, endDate } = getStatementMonthRange(
  getStableStatementStartDate(
    dateFromYearMonthCode(
      yearMonthCodeInput,
    ),
  ),
);
const yearMonthCode = toYearMonthCode(startDate);

async function getInstitutionAccounts(institutionId: InstitutionID) {
  const requisitionsRequestAgent = createRequisitionsRequestAgent({
    access: accessToken,
  });
  const agreementRequestAgent = createAgreementsRequestAgent({
    access: accessToken,
  });
  const requisition = await requisitionsRequestAgent.getRequisition(
    institutionId,
  ).then((req) =>
    agreementRequestAgent.getAgreement(req.agreement)
      .then((agreement) => isAgreementExpired(agreement, today))
      .then((agreementExpired) => {
        if (agreementExpired) throw new Error("Argreement expired");
        return req;
      })
  ).catch(() =>
    requisitionsRequestAgent.authenticate(
      crypto.randomUUID(),
      institutionId,
    )
  );
  return withThirtyTwoDayCache(`${institutionId}_ACCOUNTS`)(
    requisitionsRequestAgent.getAccountsList,
  )(
    requisition.requisitionId,
  );
}

async function getAccountTransactions(
  institutionId: string,
  accountId: string,
) {
  const accountsRequestAgent = createAccountsRequestAgent({
    access: accessToken,
  });
  const { account: accountDetail } = await withThirtyTwoDayCache(
    `${institutionId}_ACCOUNT_DETAIL_${accountId}`,
  )(accountsRequestAgent.getAccountDetail)(accountId);

  const { transactions: { booked } } = await withThirtyTwoDayCache(
    `${institutionId}_ACCOUNT_TRANSACTIONS_${accountId}_${yearMonthCode}`,
  )(
    accountsRequestAgent.getAccountTransactions,
  )(
    accountId,
    startDate,
    endDate,
  );
  return booked.map((bookedT: Transaction) => ({
    ...bookedT,
    institution: {
      id: institutionId,
      accountNumber: getAccountNumber(accountDetail),
      accountType: getAccountType(accountDetail),
      softCode: isCreditCardAccount(accountDetail)
        ? undefined
        : getAccountSortCode(accountDetail),
    },
  }));
}

async function getTansactions(institutionId: InstitutionID) {
  const accounts = await getInstitutionAccounts(institutionId);
  return (await Array.fromAsync((async function* (accountIds: string[]) {
    for (const accountId of accountIds) {
      yield getAccountTransactions(institutionId, accountId);
    }
  })(
    accounts,
  ))).flat();
}

async function getAccountBalances(
  institutionId: string,
  accountId: string,
) {
  const accountsRequestAgent = createAccountsRequestAgent({
    access: accessToken,
  });
  const { account: accountDetail } = await withThirtyTwoDayCache(
    `${institutionId}_ACCOUNT_DETAIL_${accountId}`,
  )(accountsRequestAgent.getAccountDetail)(accountId);
  const { balances: accountBalances } = await withThirtyTwoDayCache(
    `${institutionId}_ACCOUNT_BALANCES_${accountId}_${yearMonthCode}`,
  )(
    accountsRequestAgent.getAccountBalances,
  )(
    accountId,
  );
  return findBalance(accountDetail, accountBalances);
}

async function getBalances(institutionId: InstitutionID) {
  const accounts = await getInstitutionAccounts(institutionId);
  const balances = await Array.fromAsync(
    (async function* (accountIds: string[]) {
      for (const accountId of accountIds) {
        yield getAccountBalances(institutionId, accountId);
      }
    })(
      accounts,
    ),
  );
  return balances.filter(Boolean).reduce(
    (prev, amount) => prev + parseFloat(amount!.amount),
    0,
  );
}

const requestionData = await Array.fromAsync((async function* () {
  for (const ENABLED_REQUESTION of APP_ENABLED_REQUESITIONS) {
    const balance = await getBalances(ENABLED_REQUESTION);
    const transactions = await getTansactions(ENABLED_REQUESTION);
    yield {
      balance,
      transactions,
    };
  }
})());
const balance = requestionData.reduce((sum, data) => sum + data.balance, 0);
const transactions = requestionData.map((data) => data.transactions).flat();

await saveTransactionsAsMonthlyStatement(
  yearMonthCode,
  asStatement(withBalance(
    withPeriod(fromTransactions(transactions), {
      start: startDate.toString(),
      end: endDate.toString(),
    }),
    {
      amount: {
        amount: new Intl.NumberFormat("en-GB", {
          useGrouping: false,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(balance),
        currency: "GBP",
      },
      referenceDate: today.toString(),
    },
  )),
);
