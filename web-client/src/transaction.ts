import type { Institution, Transaction } from "@app/open-banking/types";

type InstitutionInfo = Omit<Institution, "id">;
export function getInstitutions(
  transactions: Transaction[],
): (readonly [string, InstitutionInfo[]])[] {
  const institutions = transactions.reduce<Record<string, InstitutionInfo[]>>(
    (institutions, transaction) => {
      const { institution } = transaction;
      const institutionId = institution.id.split("_")[0];
      if (!institutions[institutionId]) {
        institutions[institutionId] = [];
      }

      const existingInstitutionAccount = institutions[institutionId].find((
        institutionInfo,
      ) =>
        institutionInfo.softCode === institution.softCode &&
        institutionInfo.accountNumber === institution.accountNumber &&
        institutionInfo.accountType === institution.accountType
      );
      if (existingInstitutionAccount) return institutions;
      institutions[institutionId].push({
        softCode: institution.softCode,
        accountNumber: institution.accountNumber,
        accountType: institution.accountType,
      });

      return institutions;
    },
    {},
  );

  return Object.entries(institutions).map(([institutionId, accounts]) => {
    return [
      institutionId,
      accounts.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber)),
    ] as const;
  }).toSorted(([a], [b]) => a.localeCompare(b));
}
