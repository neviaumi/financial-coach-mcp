import { APP_ENABLED_REQUESITIONS } from "@/config.ts";
import {
  Credentials,
  getAccessToken,
  initializeAccessToken,
} from "@/open-banking/token.ts";
import { initializeCache } from "@/utils/cache.ts";
import {
  createRequisitionsRequestAgent,
  InstitutionID,
} from "@/open-banking/requisitions.ts";
import { Transaction } from "@/open-banking/types.ts";
import {
  createAccountsRequestAgent,
  getAccountNumber,
  getAccountType,
  getConfirmedTransactionDateRange,
} from "@/open-banking/accounts.ts";
import {
  fromTransactions,
  saveTransactionsAsMonthlyStatement,
} from "@/open-banking/bank-statements.ts";

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
const { startDate, endDate } = getConfirmedTransactionDateRange(
  Temporal.Now.plainDateISO(),
);
const yearMonthCode = `${startDate.year}${startDate.monthCode}`;

async function getTansactions(institutionId: InstitutionID) {
  const requisitionsRequestAgent = createRequisitionsRequestAgent({
    access: accessToken,
  });
  const accountsRequestAgent = createAccountsRequestAgent({
    access: accessToken,
  });
  const requisition = await requisitionsRequestAgent.getRequisition(
    institutionId,
  ).catch(() =>
    requisitionsRequestAgent.authenticate(
      crypto.randomUUID(),
      institutionId,
    )
  );
  const accounts = await withThirtyTwoDayCache(`${institutionId}_ACCOUNTS`)(
    requisitionsRequestAgent.getAccountsList,
  )(
    requisition.requisitionId,
  );
  return (await Array.fromAsync((async function* (accountIds: string[]) {
    for (const accountId of accountIds) {
      const { account: accountDetail } = await withThirtyTwoDayCache(
        `${institutionId}_ACCOUNT_DETAIL_${accountId}`,
      )(accountsRequestAgent.getAccountDetail)(accountId);

      const { transactions: { booked, _pending } } =
        await withThirtyTwoDayCache(
          `${institutionId}_ACCOUNT_TRANSACTIONS_${accountId}_${yearMonthCode}`,
        )(
          accountsRequestAgent.getAccountTransactions,
        )(
          accountId,
          startDate,
          endDate,
        );
      yield booked.map((bookedT: Transaction) => ({
        ...bookedT,
        institution: {
          id: institutionId,
          accountNumber: getAccountNumber(accountDetail),
          accountType: getAccountType(accountDetail),
        },
      }));
    }
  })(
    accounts,
  ))).flat();
}

const transactions = (await Array.fromAsync((async function* () {
  for (const ENABLED_REQUESTION of APP_ENABLED_REQUESITIONS) {
    yield getTansactions(ENABLED_REQUESTION);
  }
})())).flat();
await saveTransactionsAsMonthlyStatement(
  yearMonthCode,
  fromTransactions(transactions),
);
