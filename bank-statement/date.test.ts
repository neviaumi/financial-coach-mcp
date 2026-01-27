import { getStableStatementStartDate } from "@/date.ts";
import { assertEquals } from "@std/assert";
import { stub } from "@std/testing/mock";

[
  ["2024-01-15", "2028-10-01", "2023-12-01"],
  ["2024-02-15", "2024-02-05", "2024-01-01"],
  ["2024-02-07", "2024-01-15", "2024-01-01"],
  ["2024-02-08", "2024-01-15", "2024-01-01"],
  ["2024-02-15", "2024-01-15", "2024-01-01"],
  ["2024-02-15", "2023-12-15", "2023-12-01"],
].forEach(([today, input, targetStartDate]) => {
  Deno.test(`getStableStatementStartDate today=${today} input=${input}`, () => {
    const timeStub = stub(
      Temporal.Now,
      "plainDateISO",
      () => Temporal.PlainDate.from(today),
    );
    try {
      const inputDate = Temporal.PlainDate.from(input);
      const startDate = getStableStatementStartDate(inputDate);
      assertEquals(startDate.toString(), targetStartDate);
    } finally {
      timeStub.restore();
    }
  });
});
