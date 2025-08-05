import { withCache } from "@/utils/cache.ts";
import {
  APP_GO_CARD_LESS_SECRET_ID,
  APP_GO_CARD_LESS_SECRET_KEY,
} from "@/config.ts";

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
          secret_id: APP_GO_CARD_LESS_SECRET_ID,
          secret_key: APP_GO_CARD_LESS_SECRET_KEY,
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
