import { getAccessToken } from "./token/token.ts";
import { withCache } from "./cache.ts";
import { createRequisitionsRequestAgent } from "./requisitions.ts";
import {
  createAccountsRequestAgent,
  getConfirmedTransactionDateRange,
} from "./accounts.ts";

// const accessToken: string = await getAccessToken();

const result = withCache("testing", {
  expireAt: Temporal.Now.plainDateTimeISO().add({
    days: 32,
  }),
})<(input: number) => number>((input: number) => {
  return input * 10;
})(10);
console.log(result)
//
// const requisitionsRequestAgent = createRequisitionsRequestAgent({
//   access: accessToken,
// });
// const accountsRequestAgent = createAccountsRequestAgent({
//   access: accessToken,
// });
// const requisition = await requisitionsRequestAgent.getRequisition(
//   "BARCLAYS_BUKBGB22",
// ).catch(() =>
//   requisitionsRequestAgent.authenticate(
//     crypto.randomUUID(),
//     "BARCLAYS_BUKBGB22",
//   )
// );
// const accounts = await requisitionsRequestAgent.getAccountsList(
//   requisition.requisitionId,
// );
// for (const account of accounts) {
// const accountDetail = await accountsRequestAgent.getAccountDetail(account)
// const {startDate, endDate} = getConfirmedTransactionDateRange(Temporal.Now.plainDateISO())
// const transactions = await accountsRequestAgent.getAccountTransactions(account, startDate, endDate)
// console.log(account)
// console.log(accountDetail)
// console.log(startDate.toPlainYearMonth().toString())
// console.log(transactions)
// }
