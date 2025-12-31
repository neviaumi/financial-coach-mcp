import { toJson } from "@app/lib/fetch";
import { Token } from "@app/open-banking/types";

type Agreement = {
  id: string;
  created: string;
  accepted: string;
  access_valid_for_days: number;
  institution_id: string;
};

export function createAgreementsRequestAgent(token: Token) {
  return {
    getAgreement: (agreementId: string): Promise<Agreement> => {
      return fetch(
        `https://bankaccountdata.gocardless.com/api/v2/agreements/enduser/${agreementId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.access}`,
          },
        },
      ).then(toJson<Agreement>);
    },
  };
}

export function isAgreementExpired(
  agreement: Agreement,
  today: Temporal.PlainDate,
): boolean {
  const acceptedDate = Temporal.PlainDate.from(agreement.accepted.slice(0, 10));
  const expiryDate = acceptedDate.add({
    days: agreement.access_valid_for_days,
  });
  return today.until(expiryDate).total("days") <= 0;
}
