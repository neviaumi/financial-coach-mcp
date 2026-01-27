import { toJson } from "@app/lib/fetch";
import type {
  Account,
  Amount,
  Balance,
  Token,
  Transaction,
} from "@app/open-banking/types";

export function isCreditCardAccount(account: Account): boolean {
  return account.cashAccountType === "CARD";
}

export function getAccountSortCode(account: Account): string {
  if (isCreditCardAccount(account)) {
    throw new Error("Credit card account do not have a sort code");
  }
  return Array.from(
    { length: 3 },
    (_, i) => account.scan!.slice(i * 2, (i * 2) + 2),
  ).join("-");
}

export function getAccountNumber(account: Account): string {
  if (isCreditCardAccount(account)) {
    return account.maskedPan!;
  }
  return account.scan!.slice(6);
}

export function getAccountType(account: Account) {
  if (isCreditCardAccount(account)) {
    return "CreditCard" as const;
  }
  if (account.cashAccountType === "CACC") {
    return "Current" as const;
  }
  if (account.cashAccountType === "SVGS") {
    return "Saving" as const;
  }
  return account.name ?? "Generic" as const;
}

export function findBalance(
  account: Account,
  balances: Balance[],
): Amount | undefined {
  let balance = null;
  if (isCreditCardAccount(account)) {
    balance = balances.find((balance) =>
      balance.balanceType === "interimBooked"
    );
  } else {
    balance = balances.find((balance) =>
      ["interimAvailable", "expected"].includes(balance.balanceType)
    );
  }
  if (balance) return balance.balanceAmount;
  console.log(
    `No current balance find on ${getAccountNumber(account)}`,
    balances,
  );
  return undefined;
}

export function createAccountsRequestAgent(token: Token) {
  return {
    getAccountBalances: (
      accountId: string,
    ): Promise<{ balances: Balance[] }> => {
      return fetch(
        `https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/balances/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.access}`,
          },
        },
      ).then(toJson<{ balances: Balance[] }>);
    },

    getAccountDetail: (accountId: string): Promise<Account> => {
      return fetch(
        `https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/details`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.access}`,
          },
        },
      ).then(toJson<Account>);
    },

    getAccountTransactions: (
      accountId: string,
      dateFrom: Temporal.PlainDate,
      dateTo: Temporal.PlainDate,
    ): Promise<
      { transactions: { booked: Transaction[]; "pending": Transaction[] } }
    > => {
      const requestUrl = (() => {
        const url = new URL(
          `https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/transactions`,
        );
        url.searchParams.set("date_from", dateFrom.toString());
        url.searchParams.set("date_to", dateTo.toString());
        return url;
      })();
      return fetch(
        requestUrl,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.access}`,
          },
        },
      ).then(
        toJson<
          { transactions: { booked: Transaction[]; "pending": Transaction[] } }
        >,
      );
    },
  };
}
