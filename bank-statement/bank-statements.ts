import type { Statement, Transaction } from "@/types.ts";
import { readAll } from "@std/io/read-all";
import { filePathRelativeToCacheDir } from "@app/lib/workspace";
import type { YearMonthCode } from "@/year-month-code.ts";

type BaseStatement = Omit<Statement, "period" | "balance">;

export function withPeriod(
  statement: BaseStatement,
  period: Statement["period"],
): BaseStatement & { period: Statement["period"] } {
  return Object.assign(statement, {
    period,
  });
}

export function withBalance(
  statement: BaseStatement,
  balance: Statement["balance"],
): BaseStatement & { balance: Statement["balance"] } {
  return Object.assign(statement, {
    balance,
  });
}

export function asStatement(statement: BaseStatement): Statement {
  return statement as Statement;
}

export function fromTransactions(
  transactions: Transaction[],
): Omit<Statement, "period" | "balance"> {
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
  return {
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
