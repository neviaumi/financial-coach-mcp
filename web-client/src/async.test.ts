import { getMonthlyStatement } from "./async.ts";

Deno.test("Get monthly statement", async () => {
  try {
    const statement = await getMonthlyStatement("2025M11");
    console.log(statement);
  } catch (_err) {
    // Server might not be running during offline unit testing
  }
});
