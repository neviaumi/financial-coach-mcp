type MonthCode =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12";
export type YearMonthCode = `${number}M${MonthCode}`;
export function isYearMonthCode(value: string): value is YearMonthCode {
  // Use a Regex to check for exactly 4 digits, an M, and 2 digits
  return /^\d{4}M(0[1-9]|1[0-2])$/.test(value);
}
export class InvalidYearMonthCodeError extends Error {
  constructor(value: string) {
    super(
      `Invalid YearMonthCode: ${value}, expected format YYYYMMM, for example: 2023M01`,
    );
    this.name = "InvalidYearMonthCodeError";
  }
}

export function toYearMonthCode(
  date: Temporal.PlainDate | string,
): YearMonthCode {
  if (!date) throw new InvalidYearMonthCodeError(`yearMonthCode is empty`);
  const yearMonthCode: string = typeof date === "string"
    ? date
    : `${date.year}${date.monthCode}`;
  if (isYearMonthCode(yearMonthCode)) {
    return yearMonthCode;
  } else throw new InvalidYearMonthCodeError(yearMonthCode);
}
