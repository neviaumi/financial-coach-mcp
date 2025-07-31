import { assertEquals } from "@std/assert";
import { getAccountNumber } from "./accounts.ts";

[
  ["CARD", {
    maskedPan: "************7005",
  }, "************7005"] as const,
  ["CACC", {
    scan: "20253653631052"
  }, "53631052"] as const,
  ["SVGS", {
    scan: "20253653631052"
  }, "53631052"] as const,
].forEach(([cashAccountType, account, expectedAccountNumber ]) => {
  Deno.test(`getAccountNumber on cashAccountType=${cashAccountType}`, () => {
    assertEquals(
      getAccountNumber(
        {
          cashAccountType,
          ...account,
        } as any,
      ),
        expectedAccountNumber,
    );
  });
});