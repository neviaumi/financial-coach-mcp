import open from "open";
import { toJson } from "@app/lib/fetch";
import {
  type InstitutionID,
  institutions,
} from "@app/open-banking/institutions";
import { Token } from "@app/open-banking/types";
import { APP_OPENBANKING_HOST, APP_OPENBANKING_PORT } from "@/config.ts";
import { prepareQRCodeForURL, printQRCode } from "@/utils/qr-code.ts";

export function createRequisitionsRequestAgent(token: Token) {
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
      ).then(toJson<{ accounts: string[] }>).then((resp) => resp.accounts);
    },
    getRequisition: (institutionId: InstitutionID) => {
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
      ).then(
        toJson<{
          results: {
            reference: string;
            id: string;
            agreement: string;
            institution_id: string;
            status: string;
          }[];
        }>,
      ).then((resp) =>
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
          agreement: resp.agreement,
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
      ).then(toJson<{ id: string; link: string }>);
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
