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

export type Amount = {
  amount: string;
  currency: string;
};

export type Transaction = {
  bookingDate: string;
  valueDate?: string;
  bookingDateTime: string;
  valueDateTime?: string;
  transactionAmount: Amount;
  creditorName?: string;
  remittanceInformationUnstructured: string;
  merchantCategoryCode?: string;
  internalTransactionId: string;
  bank: string;
  accountNumber: string;
  accountType: string;
};

export type Statement = {
  balance: {
    opening: Amount;
    closing: Amount;
  };
  transactions: Array<
    Transaction & {
      to: string;
    }
  >;
};
