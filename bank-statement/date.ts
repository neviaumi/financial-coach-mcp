export function getStableStatementStartDate(
  date: Temporal.PlainDate,
): Temporal.PlainDate {
  const today = Temporal.Now.plainDateISO();
  if (today.since(date.with({ day: date.daysInMonth })).total("day") < 8) {
    return today.subtract({ months: 1 }).with({ day: 1 });
  }
  return date.with({ day: 1 });
}
export function getStatementMonthRange(startDate: Temporal.PlainDate): {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
} {
  return { startDate, endDate: startDate.with({ day: startDate.daysInMonth }) };
}
