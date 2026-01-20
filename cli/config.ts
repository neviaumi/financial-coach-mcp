import type { InstitutionID } from "@app/open-banking/institutions";

export const APP_OPENBANKING_PORT = 8083;
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

export const APP_OPENBANKING_HOST = APP_ENV === "DEV"
  ? "127.0.0.1"
  : Deno.env.get("APP_OPENBANKING_HOST");
if (!APP_OPENBANKING_HOST) {
  throw new Error("Missing APP_OPENBANKING_HOST enviroment variable!");
}

export const APP_ENABLED_REQUESITIONS: InstitutionID[] = APP_ENV === "DEV"
  ? ["BARCLAYS_BUKBGB22"]
  : [
    "BARCLAYS_BUKBGB22",
    "CHASE_CHASGB2L",
    "HSBC_HBUKGB4B",
  ];
