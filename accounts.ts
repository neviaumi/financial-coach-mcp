import { convertFetchResponse } from "./fetch.ts";
type Account = {
  resourceId: string;
  scan?: string;
  maskedPan?: string;
  currency: string;
  ownerName: string;
  // https://docs.neonomics.io/docs/iso-codes
  // ISO20022 ExternalCashAccountType1Code
  cashAccountType: string;
  usage: string;
};

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

export async function saveTransactionsAsMonthlyStatement(
  yearMonthCode: string,
  transactions: any[],
) {
  await Deno.mkdir(".cache/statements", { recursive: true });
  await Deno.open(`.cache/statements/${yearMonthCode}.json`, {
    write: true,
    create: true,
  }).then((file) => {
    const encoder = new TextEncoder();
    file.write(encoder.encode(JSON.stringify(transactions, null, 4))).finally(
      () => {
        file.close();
      },
    );
  });
}

export function createAccountsRequestAgent(token: { access: string }) {
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
      ).then(convertFetchResponse);
    },

    getAccountTransactions: (
      accountId: string,
      dateFrom: Temporal.PlainDate,
      dateTo: Temporal.PlainDate,
    ): Promise<any[]> => {
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
      ).then(convertFetchResponse).then((res) => res.transactions["booked"]);
    },
  };
}
