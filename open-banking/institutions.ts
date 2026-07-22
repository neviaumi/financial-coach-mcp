export const institutions = {
  ["HSBC_HBUKGB4B"]: {
    id: "HSBC_HBUKGB4B",
    name: "HSBC Personal",
  },
  ["BARCLAYS_BUKBGB22"]: {
    id: "BARCLAYS_BUKBGB22",
    name: "Barclays Personal",
  },
  ["CHASE_CHASGB2L"]: {
    id: "CHASE_CHASGB2L",
    name: "Chase Bank",
  },
  ["AMERICAN_EXPRESS_AESUGB21"]: {
    id: "AMERICAN_EXPRESS_AESUGB21",
    name: "American Express",
  },
};

export type InstitutionID = keyof (typeof institutions);
