import { getAccessToken } from "./token/token.ts";
import { createRequisitionsRequestAgent } from "./requisitions.ts";
import { createAccountsRequestAgent } from "./accounts.ts";

const accessToken: string = await getAccessToken();

const requisitionsRequestAgent = createRequisitionsRequestAgent({
  access: accessToken,
});
const accountsRequestAgent = createAccountsRequestAgent({
  access: accessToken,
});
const requisition = await requisitionsRequestAgent.authenticate(
  crypto.randomUUID(),
  "CHASE_CHASGB2L",
);
const accounts = await requisitionsRequestAgent.getAccountsList(
  requisition.requisitionId,
);
for (const account of accounts) {
  await accountsRequestAgent.getAccountDetail(account).then(console.log);
}
