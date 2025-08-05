export const APP_OPENBANKING_HOST = "banking.dk-home-pi.net";
export const APP_OPENBANKING_PORT = 8083;
export const APP_GO_CARD_LESS_SECRET_ID = Deno.env.get(
  "GO_CARD_LESS_SECRET_ID",
);
export const APP_GO_CARD_LESS_SECRET_KEY = Deno.env.get(
  "GO_CARD_LESS_SECRET_KEY",
);

if (!APP_GO_CARD_LESS_SECRET_ID || !APP_GO_CARD_LESS_SECRET_KEY) {
  throw new Error("Missing environment variables");
}
