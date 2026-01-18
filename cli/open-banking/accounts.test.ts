import { assertEquals, assertThrows } from "@std/assert";
import {
  getAccountNumber,
  getAccountSortCode,
  getConfirmedTransactionDateRange,
} from "./accounts.ts";
import type { Account } from "@app/open-banking/types";

[
  [
    Temporal.PlainDate.from("2025-02-05"),
    ["2024-12-01", "2024-12-31"],
  ] as const,
  [
    Temporal.PlainDate.from("2025-02-12"),
    ["2025-01-01", "2025-01-31"],
  ] as const,
].forEach((
  [mockDate, [mockStart, mockEnd]],
) =>
  Deno.test(`Get Date Range from ${mockDate}`, () => {
    const { startDate, endDate } = getConfirmedTransactionDateRange(mockDate);
    assertEquals(startDate.toString(), mockStart);
    assertEquals(endDate.toString(), mockEnd);
  })
);

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

Deno.test("getAccountSortCode throws on CARD", () => {
  assertThrows(
    () =>
      getAccountSortCode({
        cashAccountType: "CARD",
      } as Account),
    Error,
    "Credit card account do not have a sort code",
  );
});

[
  ["CACC", "12345678901234", "12-34-56"] as const,
  ["SVGS", "65432109876543", "65-43-21"] as const,
].forEach(([cashAccountType, scan, expectedSortCode]) => {
  Deno.test(`getAccountSortCode on cashAccountType=${cashAccountType}`, () => {
    assertEquals(
      getAccountSortCode(
        {
          cashAccountType,
          scan,
        } as Account,
      ),
      expectedSortCode,
    );
  });
});
