import { API_BASE_URL } from "@/config.ts";
import { toJson } from "@app/lib/fetch";
import type { YearMonthCode } from "@app/bank-statement/year-month-code";
import type { Statement } from "@app/open-banking/types";

export function getMonthlyStatement(
  yearMonthCode: YearMonthCode,
): Promise<Statement> {
  return fetch(
    new URL(
      `/statements/${yearMonthCode}.json`,
      API_BASE_URL,
    ),
  ).then(toJson<Statement>);
}
