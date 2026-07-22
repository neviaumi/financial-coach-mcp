import type { InstitutionID } from "@app/open-banking/institutions";

const rawPort = Deno.env.get("APP_OPENBANKING_PORT");
export const APP_OPENBANKING_PORT = rawPort ? parseInt(rawPort, 10) : 8083;
if (Number.isNaN(APP_OPENBANKING_PORT)) {
  throw new Error(
    "Invalid APP_OPENBANKING_PORT environment variable (not a number)!",
  );
}
export const APP_ENV: "PROD" | "DEV" = Deno.env.get("APP_ENV") as
  | "PROD"
  | "DEV";
export const APP_GO_CARD_LESS_SECRET_ID = Deno.env.get(
  "GO_CARD_LESS_SECRET_ID",
);
export const APP_GO_CARD_LESS_SECRET_KEY = Deno.env.get(
  "GO_CARD_LESS_SECRET_KEY",
);

if (!APP_ENV) {
  throw new Error("APP_ENV is required! either PROD or DEV");
}

if (!APP_GO_CARD_LESS_SECRET_ID || !APP_GO_CARD_LESS_SECRET_KEY) {
  throw new Error("Missing GO_CARD_LESS enviroment variable");
}

export const APP_OPENBANKING_REDIRECT_URL =
  Deno.env.get("APP_OPENBANKING_REDIRECT_URL") || (
    APP_ENV === "DEV" ? `http://127.0.0.1:${APP_OPENBANKING_PORT}` : undefined
  );
if (!APP_OPENBANKING_REDIRECT_URL) {
  throw new Error("Missing APP_OPENBANKING_REDIRECT_URL environment variable!");
}

export const APP_ENABLED_REQUESITIONS: InstitutionID[] = [
  "BARCLAYS_BUKBGB22",
  "CHASE_CHASGB2L",
  "HSBC_HBUKGB4B",
];
