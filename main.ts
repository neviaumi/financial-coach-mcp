import { getAccessToken } from "@/open-banking/token.ts";
import { withCache } from "@/utils/cache.ts";
import {
  createRequisitionsRequestAgent,
  InstitutionID,
} from "@/open-banking/requisitions.ts";
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

const accessToken: string = await getAccessToken();
const { startDate, endDate } = getConfirmedTransactionDateRange(
  Temporal.Now.plainDateISO(),
);

function withThirtyTwoDayCache(key: string) {
  return withCache(key, {
    expireAt: Temporal.Now.plainDateTimeISO().add({
      days: 32,
    }),
  });
}

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

      const transactions = await accountsRequestAgent.getAccountTransactions(
        accountId,
        startDate,
        endDate,
      );
      yield transactions.map((t) =>
        Object.assign(t, {
          bank: institutionId,
          accountNumber: getAccountNumber(accountDetail),
          accountType: getAccountType(accountDetail),
        })
      );
    }
  })(
    accounts,
  ))).flat();
}

const transactions = (await Array.fromAsync((async function* () {
  yield getTansactions("BARCLAYS_BUKBGB22");
})())).flat();
await saveTransactionsAsMonthlyStatement(
  `${startDate.year}${startDate.monthCode}`,
  fromTransactions(transactions),
);
