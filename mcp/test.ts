import { getMonthlyStatement } from "@/open-banking/bank-statements.ts";

await getMonthlyStatement("2025M06").then((item) => {
  console.log(item);
});
