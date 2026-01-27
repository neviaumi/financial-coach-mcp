import {
  dateFromYearMonthCode,
  toYearMonthCode,
} from "@app/bank-statement/year-month-code";

if (Deno.args.length < 1) {
  throw new Error("Use [year-month-code|now]");
}

const [yearMonthCode] = Deno.args;
console.log(toYearMonthCode(dateFromYearMonthCode(yearMonthCode)));
