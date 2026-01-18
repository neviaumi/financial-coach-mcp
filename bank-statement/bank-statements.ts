import type { Statement, Transaction } from "@app/open-banking/types";
import { readAll } from "@std/io/read-all";
import { filePathRelativeToCacheDir } from "@app/lib/workspace";
import type { YearMonthCode } from "@/year-month-code.ts";

export function withPeriod(
  statement: Omit<Statement, "period">,
  period: Statement["period"],
): Statement {
  return Object.assign(statement, {
    period,
  });
}

export function fromTransactions(
  transactions: Transaction[],
): Omit<Statement, "period"> {
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
      new Date(a.valueDateTime ?? a.bookingDateTime).getTime() -
      new Date(b.valueDateTime ?? b.bookingDateTime).getTime()
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
  yearMonthCode: YearMonthCode,
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

export function getMonthlyStatement(
  yearMonthCode: YearMonthCode,
): Promise<Statement> {
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
