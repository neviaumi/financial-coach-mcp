import open from "open";
import { convertFetchResponse } from "./fetch.ts";

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
            "redirect": `http://localhost:8080/${institutionId}/callback`,
            "institution_id": institutionId,
            "reference": loginReference,
            "user_language": "en",
          }),
        },
      ).then(convertFetchResponse);
      console.log(`Open Link: ${requisitionSignInLink}`);
      const { promise, reject, resolve } = Promise.withResolvers();
      await open(requisitionSignInLink).then(() => {
        const server = Deno.serve({
          port: 8080,
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
