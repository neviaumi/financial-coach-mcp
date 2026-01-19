import { getMonthlyStatement } from "./async.ts";

Deno.test("Get monthly statement", async () => {
  const statement = await getMonthlyStatement("2025M11");
  console.log(statement);
});
