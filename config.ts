import type { InstitutionID } from "@/open-banking/requisitions.ts";

export const APP_OPENBANKING_HOST = "banking.dk-home-pi.net";
export const APP_OPENBANKING_PORT = 8083;
export const APP_ENV = Deno.env.get("APP_ENV");
export const APP_GO_CARD_LESS_SECRET_ID = Deno.env.get(
  "GO_CARD_LESS_SECRET_ID",
);
export const APP_GO_CARD_LESS_SECRET_KEY = Deno.env.get(
  "GO_CARD_LESS_SECRET_KEY",
);
export const APP_ENABLED_REQUESITIONS: InstitutionID[] = [
  "BARCLAYS_BUKBGB22",
  "CHASE_CHASGB2L",
  "HSBC_HBUKGB4B",
];

if (!APP_ENV) {
  throw new Error("APP_ENV is required! either PROD or DEV");
}

if (!APP_GO_CARD_LESS_SECRET_ID || !APP_GO_CARD_LESS_SECRET_KEY) {
  throw new Error("Missing GO_CARD_LESS enviroment variable");
}
