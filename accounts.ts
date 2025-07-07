export function createAccountsRequestAgent(token: { access: string }) {
  return {
    getAccountDetail: (accountId: string) => {
      return fetch(
        `https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/details`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.access}`,
          },
        },
      ).then((res) => res.json()).then((res) => res.account);
    },
  };
}
