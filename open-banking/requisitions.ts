import open from "open";
import { convertFetchResponse } from "@/utils/fetch.ts";
import { APP_OPENBANKING_HOST, APP_OPENBANKING_PORT } from "@/config.ts";
import { prepareQRCodeForURL, printQRCode } from "@/utils/qr-code.ts";

const institutions = {
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
};

export type InstitutionID = keyof (typeof institutions);

export function createRequisitionsRequestAgent(token: { access: string }) {
  return {
    getAccountsList: (requisitionId: string): Promise<string[]> => {
      return fetch(
        `https://bankaccountdata.gocardless.com/api/v2/requisitions/${requisitionId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.access}`,
          },
        },
      ).then(convertFetchResponse).then((resp) => resp.accounts);
    },
    getRequisition: (institutionId: keyof (typeof institutions)) => {
      const query = new URLSearchParams();
      query.set("limit", "128");
      query.set("offset", "0");
      return fetch(
        new URL(
          `https://bankaccountdata.gocardless.com/api/v2/requisitions?${query}`,
        ),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.access}`,
          },
        },
      ).then(convertFetchResponse).then((resp) =>
        resp.results.find((
          result: { "institution_id": string; "status": string },
        ) =>
          result["institution_id"] === institutionId &&
          result["status"] === "LN"
        )
      ).then((resp) => {
        if (!resp) {
          throw new Error("Requisition not found");
        }
        return {
          reference: resp.reference,
          requisitionId: resp.id,
        };
      });
    },
    authenticate: async (
      loginReference: string,
      institutionId: keyof (typeof institutions),
    ) => {
      const { id: requisitionId, link: requisitionSignInLink } = await fetch(
        "https://bankaccountdata.gocardless.com/api/v2/requisitions/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.access}`,
          },
          body: JSON.stringify({
            "redirect": new URL(
              `/auth/${institutionId}/callback`,
              `http://${APP_OPENBANKING_HOST}:${APP_OPENBANKING_PORT}`,
            ).toString(),
            "institution_id": institutionId,
            "reference": loginReference,
            "user_language": "en",
          }),
        },
      ).then(convertFetchResponse);
      console.log(`Please scan the QR code to log in for ${institutionId}.`);
      await prepareQRCodeForURL(new URL(requisitionSignInLink)).then(
        printQRCode,
      );
      const { promise, reject, resolve } = Promise.withResolvers();
      await open(requisitionSignInLink).then(() => {
        const server = Deno.serve({
          port: APP_OPENBANKING_PORT,
          hostname: "0.0.0.0",
        }, () => {
          setTimeout(() => {
            server.shutdown().then(resolve).catch(reject);
          });
          return new Response(
            `Callback from ${institutions[institutionId].name}`,
          );
        });
        return promise;
      });
      return {
        reference: loginReference,
        requisitionId,
      };
    },
  };
}
