import { assertEquals, assertExists } from "@std/assert";
import { getInstitutions } from "./transaction.ts";
import type { Transaction } from "@app/open-banking/types";

Deno.test("getInstitutions sorts accounts by accountNumber", () => {
  const transactions: Transaction[] = [
    {
      institution: {
        id: "inst1",
        accountNumber: "ACC-002",
        accountType: "Checking",
      },
      bookingDate: "2023-01-01",
      bookingDateTime: "2023-01-01T10:00:00Z",
      transactionAmount: { amount: "100", currency: "USD" },
      internalTransactionId: "1",
      remittanceInformationUnstructured: "test1",
    },
    {
      institution: {
        id: "inst1",
        accountNumber: "ACC-001",
        accountType: "Savings",
      },
      bookingDate: "2023-01-02",
      bookingDateTime: "2023-01-02T10:00:00Z",
      transactionAmount: { amount: "200", currency: "USD" },
      internalTransactionId: "2",
      remittanceInformationUnstructured: "test2",
    },
    {
      institution: {
        id: "inst1",
        accountNumber: "ACC-003",
        accountType: "Credit",
      },
      bookingDate: "2023-01-03",
      bookingDateTime: "2023-01-03T10:00:00Z",
      transactionAmount: { amount: "300", currency: "USD" },
      internalTransactionId: "3",
      remittanceInformationUnstructured: "test3",
    },
  ];

  const result = getInstitutions(transactions);

  assertEquals(result.length, 1);
  assertExists(result.find(([id]) => id === "inst1"));
  const [, accounts] = result.find(([id]) => id === "inst1")!;
  assertEquals(accounts.length, 3);
  assertEquals(accounts[0].accountNumber, "ACC-001");
  assertEquals(accounts[1].accountNumber, "ACC-002");
  assertEquals(accounts[2].accountNumber, "ACC-003");
});
