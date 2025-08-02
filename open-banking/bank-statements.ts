import type { Statement, Transaction } from "./types.ts";
import { readAll } from "@std/io/read-all";
import { filePathRelativeToCacheDir } from "@/utils/cache.ts";

export function fromTransactions(transactions: Transaction[]): Statement {
  const transactionsSorted = transactions
    .map((transaction) => {
      const to = (() => {
        if (transaction.remittanceInformationUnstructured) {
          return transaction.remittanceInformationUnstructured;
        }
        return transaction.creditorName;
      })();
      return Object.assign(transaction, {
        "to": to!,
      });
    })
    .toSorted((a, b) =>
      new Date(a.bookingDateTime).getTime() -
      new Date(b.bookingDateTime).getTime()
    );
  const sum = transactionsSorted.reduce(
    (acc, transaction) =>
      acc + (parseFloat(transaction.transactionAmount.amount) * 100),
    0.0,
  ) / 100;
  return {
    balance: {
      opening: {
        amount: "0",
        currency: "GBP",
      },
      closing: {
        amount: sum.toFixed(2),
        currency: "GBP",
      },
    },
    transactions: transactionsSorted,
  };
}

export async function saveTransactionsAsMonthlyStatement(
  yearMonthCode: string,
  statement: Statement,
) {
  await Deno.mkdir(filePathRelativeToCacheDir("statements"), {
    recursive: true,
  });
  await Deno.open(
    filePathRelativeToCacheDir(`statements/${yearMonthCode}.json`),
    {
      write: true,
      create: true,
    },
  ).then((file) => {
    const encoder = new TextEncoder();
    file.write(encoder.encode(JSON.stringify(statement, null, 4))).finally(
      () => {
        file.close();
      },
    );
  });
}

export function getMonthlyStatement(yearMonthCode: string) {
  return Deno.open(
    filePathRelativeToCacheDir(`statements/${yearMonthCode}.json`),
    {
      read: true,
    },
  ).then(async (file) => {
    const content = await readAll(file).finally(
      () => {
        file.close();
      },
    );
    return JSON.parse(new TextDecoder().decode(content));
  });
}
