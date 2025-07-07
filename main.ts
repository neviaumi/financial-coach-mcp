import {getAccessToken} from "./credential/credential.ts"

import open from "open";



const accessToken:string = await getAccessToken();

const institutions: {
  id: string;
  name: string;
  reference: string;
  requisitionsId: string;
}[] = [];
for (
  const targetInstitution of [
    {
      id: "HSBC_HBUKGB4B",
      name: "HSBC Personal",
    },
    { id: "BARCLAYS_BUKBGB22", name: "Barclays Personal" },
    // { id: "CHASE_CHASGB2L", name: "Chase Bank" },
  ]
) {
  const reference = crypto.randomUUID();
  const { promise, reject, resolve } = Promise.withResolvers();
  fetch("https://bankaccountdata.gocardless.com/api/v2/requisitions/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      "redirect": `http://localhost:8080/${targetInstitution.id}/callback`,
      "institution_id": targetInstitution.id,
      "reference": reference,
      "user_language": "en",
    }),
  }).then((res) => res.json()).then((resp) => {
    const { id: requisitionsId } = resp;
    open(resp.link).then(() => {
      const server = Deno.serve({
        port: 8080,
        hostname: "0.0.0.0",
      }, () => {
        setTimeout(() => {
          server.shutdown().then(() =>
            resolve({
              ...targetInstitution,
              reference,
              requisitionsId,
            })
          ).catch(reject);
        });
        return new Response(`Callback from ${targetInstitution.name}`);
      });
    });
  }).catch(reject);
  institutions.push(
    (await promise) as {
      id: string;
      name: string;
      reference: string;
      requisitionsId: string;
    },
  );
}

const bankAccounts: string[] = await Promise.all(
  institutions.map((institution) => {
    return fetch(
      `https://bankaccountdata.gocardless.com/api/v2/requisitions/${institution.requisitionsId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      },
    ).then((res) => res.json()).then((resp) => resp.accounts);
  }),
).then((accounts) => accounts.flat());

for (const bankAccount of bankAccounts) {
  await fetch(
    `https://bankaccountdata.gocardless.com/api/v2/accounts/${bankAccount}/transactions/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    },
  ).then((res) => res.json()).then(console.log);
}
