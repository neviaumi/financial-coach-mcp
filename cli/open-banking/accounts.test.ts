import { assertEquals } from "@std/assert";
import { getAccountNumber } from "./accounts.ts";
import type { Account } from "@app/open-banking/types";

[
  ["CARD", {
    maskedPan: "************7005",
  }, "************7005"] as const,
  ["CACC", {
    scan: "12345678901234",
  }, "78901234"] as const,
  ["SVGS", {
    scan: "12345678901234",
  }, "78901234"] as const,
].forEach(([cashAccountType, account, expectedAccountNumber]) => {
  Deno.test(`getAccountNumber on cashAccountType=${cashAccountType}`, () => {
    assertEquals(
      getAccountNumber(
        {
          cashAccountType,
          ...account,
        } as Account,
      ),
      expectedAccountNumber,
    );
  });
});
