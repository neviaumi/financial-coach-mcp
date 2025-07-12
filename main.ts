import { getAccessToken } from "./token/token.ts";
import { withCache } from "./cache.ts";
import {
  createRequisitionsRequestAgent,
  InstitutionID,
} from "./requisitions.ts";
import {
  createAccountsRequestAgent,
  getConfirmedTransactionDateRange,
} from "./accounts.ts";

const accessToken: string = await getAccessToken();

function withThirtyTwoDayCache(key: string) {
  return withCache(key, {
    expireAt: Temporal.Now.plainDateTimeISO().add({
      days: 32,
    }),
  });
}

async function getBankStatement(institutionId: InstitutionID) {
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
  for (const account of accounts) {
    const accountDetail = await withThirtyTwoDayCache(
      `${institutionId}_ACCOUNT_DETAIL_${account}`,
    )(accountsRequestAgent.getAccountDetail)(account);
    const { startDate, endDate } = getConfirmedTransactionDateRange(
      Temporal.Now.plainDateISO(),
    );
    const transactions = await accountsRequestAgent.getAccountTransactions(
      account,
      startDate,
      endDate,
    );
    console.log(account);
    console.log(accountDetail);
    console.log(startDate.toPlainYearMonth().toString());
    console.log(transactions);
  }
}

await getBankStatement("BARCLAYS_BUKBGB22");
