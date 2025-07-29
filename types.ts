export type Account = {
  resourceId: string;
  scan?: string;
  maskedPan?: string;
  currency: string;
  ownerName: string;
  // https://docs.neonomics.io/docs/iso-codes
  // ISO20022 ExternalCashAccountType1Code
  cashAccountType: string;
  usage: string;
};

export type Token = {
  access: string;
};

export type Transaction = {
  bookingDate: string;
  valueDate?: string;
  bookingDateTime: string;
  valueDateTime?: string;
  transactionAmount: {
    amount: string;
    currency: string;
  };
  creditorName?: string;
  remittanceInformationUnstructured: string;
  merchantCategoryCode?: string;
  internalTransactionId: string;
  bank: string;
  accountNumber: string;
  accountType: string;
};
