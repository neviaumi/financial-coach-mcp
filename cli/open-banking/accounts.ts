import { toJson } from "@app/lib/fetch";
import type { Account, Token, Transaction } from "@app/open-banking/types";

export function getConfirmedTransactionDateRange(today: Temporal.PlainDate) {
  let startDate = today.subtract({ days: 8 }).with({ day: 1 });
  let endDate = startDate.with({ day: startDate.daysInMonth });

  if (today.since(endDate).total("day") < 8) {
    startDate = startDate.subtract({ months: 1 }).with({ day: 1 });
    endDate = startDate.with({ day: startDate.daysInMonth });
  }

  return { startDate, endDate };
}

export function getAccountNumber(account: Account): string {
  if (account.cashAccountType === "CARD") {
    return account.maskedPan!;
  }
  return account.scan!.slice(6);
}

export function getAccountType(account: Account) {
  if (account.cashAccountType === "CARD") {
    return "CreditCard" as const;
  }
  return "Saving" as const;
}

export function createAccountsRequestAgent(token: Token) {
  return {
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
