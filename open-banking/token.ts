import { withCache } from "@/utils/cache.ts";

const secretId = Deno.env.get("GO_CARD_LESS_SECRET_ID");

const secretKey = Deno.env.get("GO_CARD_LESS_SECRET_KEY");

if (!secretId || !secretKey) {
  throw new Error("Missing environment variables");
}
export type AccessToken = string;

type Credentials = {
  access: string;
  refresh: string;
  access_expires: number;
  refresh_expires: number;
};

export async function getAccessToken(): Promise<AccessToken> {
  let accessToken: string | null = null;
  const { refresh: refreshToken } = await withCache(
    "REFRESH_TOKEN",
    (creds: Credentials) => {
      return {
        expireAt: Temporal.Instant.fromEpochMilliseconds(
          new Date().getTime() + (creds.refresh_expires * 1000),
        ).toZonedDateTimeISO("UTC").toPlainDateTime(),
      };
    },
  )(async (): Promise<Credentials> => {
    return fetch(
      "https://bankaccountdata.gocardless.com/api/v2/token/new/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret_id: secretId,
          secret_key: secretKey,
        }),
      },
    ).then((res) => res.json())
      .then((creds: Credentials) => {
        accessToken = creds.access;
        return {
          refresh: creds.refresh,
          refresh_expires: creds.refresh_expires,
        } as Credentials;
      });
  })();
  if (!accessToken) {
    await fetch(
      "https://bankaccountdata.gocardless.com/api/v2/token/refresh/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      },
    ).then((res) => res.json())
      .then((creds) => {
        accessToken = creds.access;
        return creds;
      });
  }
  return accessToken!;
}
