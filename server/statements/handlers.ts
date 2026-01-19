import type { Context } from "hono";
import { factory } from "@/app-factory.ts";
import { getMonthlyStatement } from "@app/bank-statement";
import { toYearMonthCode } from "@app/bank-statement/year-month-code";

import { stringify } from "@std/csv";

function extractYearMonthCodeFromPathParams(param: string) {
  return toYearMonthCode(param.split(".")[0]);
}

const app = factory.createApp();
app.get("/:yearMonthCode{.+\\.json}", (c: Context) => {
  const yearMonthCode = extractYearMonthCodeFromPathParams(
    c.req.param("yearMonthCode"),
  );
  return getMonthlyStatement(yearMonthCode).then((content) => c.json(content))
    .catch((error) => {
      console.error(`Error fetching statement for ${yearMonthCode}:`, error);
      return c.json(
        { error: "Statement not found or an error occurred." },
        404,
      );
    });
})
  .get("/:yearMonthCode{.+\\.csv}", async (c: Context) => {
    const yearMonthCode = extractYearMonthCodeFromPathParams(
      c.req.param("yearMonthCode"),
    );
    const responseBody = await getMonthlyStatement(yearMonthCode).then(
      (statement) => {
        return stringify(statement.transactions, {
          bom: true,
          columns: [
            { prop: ["institution", "id"], header: "from.Bank" },
            {
              prop: ["institution", "accountNumber"],
              header: "from.AccountNumber",
            },
            {
              prop: ["institution", "accountType"],
              header: "from.AccountType",
            },
            {
              prop: ["merchantCategoryCode"],
              header: "merchantCategoryCode",
            },
            {
              prop: ["to"],
              header: "to",
            },
            {
              prop: ["additionalInformation"],
              header: "additionalInformation",
            },
            {
              prop: ["proprietaryBankTransactionCode"],
              header: "proprietaryBankTransactionCode",
            },
            {
              prop: ["bookingDate"],
              header: "bookingDate",
            },
            {
              prop: ["transactionAmount", "amount"],
              header: "transaction.amount",
            },
            {
              prop: ["transactionAmount", "currency"],
              header: "transaction.currency",
            },
            {
              prop: ["transactionId"],
              header: "transaction.id",
            },
          ],
        });
      },
    );
    return c.body(responseBody, 200, {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${yearMonthCode}.csv"`,
    });
  }).get("/:yearMonthCode{.+\\.html}", (c: Context) => {
    return c.text("Not Implmented", 501);
  });

export default app;
