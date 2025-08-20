import type { Context } from "hono";
import { factory } from "@/server/app-factory.ts";
import { getMonthlyStatement } from "@/open-banking/bank-statements.ts";

function extractYearMonthCodeFromPathParams(param: string): string {
  return param.split(".")[0];
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
}).get("/:yearMonthCode{.+\\.csv}", (c: Context) => {
  return c.text("Not Implmented", 502);
}).get("/:yearMonthCode{.+\\.html}", (c: Context) => {
  return c.text("Not Implmented", 502);
});

export default app;
