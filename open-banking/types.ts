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

export type Institution = {
  id: string;
  accountNumber: string;
  accountType: string;
  softCode?: string;
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
  institution: Institution;
};

export type Statement = {
  period: {
    start: string;
    end: string;
  };
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
