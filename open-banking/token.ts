import {
  APP_GO_CARD_LESS_SECRET_ID,
  APP_GO_CARD_LESS_SECRET_KEY,
} from "@/config.ts";

export type AccessToken = string;

export type Credentials = {
  access: string;
  refresh: string;
  access_expires: number;
  refresh_expires: number;
};

export function initializeAccessToken(): Promise<Credentials> {
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
      return {
        refresh: creds.refresh,
        refresh_expires: creds.refresh_expires,
      } as Credentials;
    });
}

export function getAccessToken(refresh: string): Promise<AccessToken> {
  return fetch(
    "https://bankaccountdata.gocardless.com/api/v2/token/refresh/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refresh,
      }),
    },
  ).then((res) => res.json())
    .then((creds) => creds.access as AccessToken);
}
