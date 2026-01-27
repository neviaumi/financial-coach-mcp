import type {
  Amount,
  Transaction as OBTransaction,
} from "@app/open-banking/types";

export type Transaction = OBTransaction & {
  to: string;
};

type ReviewComment = {
  plain: string;
  html: string;
};

export type Statement = {
  period: {
    start: string;
    end: string;
  };
  balance: {
    referenceDate: string;
    amount: Amount;
  };
  aiReview?: {
    insightSummary: ReviewComment;
    actionPlan: Array<ReviewComment>;
    analysisRationale: Array<ReviewComment>;
  };
  transactions: Array<Transaction>;
};
