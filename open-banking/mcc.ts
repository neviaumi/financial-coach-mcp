const MCC_RANGES = [
  { start: 1, end: 1499, label: "Agriculture", icon: "🚜" },
  { start: 1500, end: 2999, label: "Contractors", icon: "🏗️" },
  { start: 3000, end: 3350, label: "Airlines", icon: "✈️" },
  { start: 3351, end: 3500, label: "Car Rental", icon: "🚗" },
  { start: 3501, end: 3999, label: "Hotels/Stay", icon: "🏨" },
  { start: 4000, end: 4799, label: "Transport", icon: "🚌" },
  { start: 4800, end: 4999, label: "Utilities/TV", icon: "🔌" },
  { start: 5000, end: 5599, label: "Retail", icon: "🛒" },
  { start: 5600, end: 5699, label: "Clothing", icon: "👕" },
  { start: 5700, end: 7299, label: "Misc Shops", icon: "🛍️" },
  { start: 7300, end: 7999, label: "Business/Fun", icon: "💼" },
  { start: 8000, end: 8999, label: "Professional", icon: "🎓" },
  { start: 9000, end: 9999, label: "Government", icon: "🏛️" },
];

export const parseMccCodeToLabel = (mccStr: string): string => {
  const code = parseInt(mccStr, 10);
  const range = MCC_RANGES.find((r) => code >= r.start && code <= r.end);
  return range ? `${range.icon} ${range.label}` : "💳 General";
};
