import { readAll } from "@std/io/read-all";
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

function isRefreshTokenCacheExists() {
  return Deno.stat("./token/refresh.json").then(() => true).catch((err) => {
    return false;
  });
}

async function getCachedRefreshToken() {
  using file = await Deno.open("./token/refresh.json", {
    read: true,
  });
  const token: Omit<Credentials, "access" | "access_expires"> & {
    created_at: number;
  } = await readAll(
    file,
  ).then((resp) => JSON.parse(new TextDecoder().decode(resp)));
  return token.refresh;
}

async function isCachedRefreshTokenValid() {
  using file = await Deno.open("./token/refresh.json", {
    read: true,
  });
  const token: Omit<Credentials, "access" | "access_expires"> & {
    created_at: number;
  } = await readAll(
    file,
  ).then((resp) => JSON.parse(new TextDecoder().decode(resp)));
  const now = new Date().getTime();
  const isExpired = (token.created_at + (token.refresh_expires * 1000)) <= now;
  return !isExpired;
}

async function cacheToken(credentials: Credentials) {
  using file = await Deno.open("./token/refresh.json", {
    write: true,
    createNew: true,
  });
  const encoder = new TextEncoder();
  await file.write(encoder.encode(JSON.stringify({
    refresh: credentials.refresh,
    refresh_expires: credentials.refresh_expires,
    created_at: new Date().getTime(),
  })));
}

export async function getAccessToken(): Promise<AccessToken> {
  if (await isRefreshTokenCacheExists() && await isCachedRefreshTokenValid()) {
    return await fetch(
      "https://bankaccountdata.gocardless.com/api/v2/token/refresh/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: await getCachedRefreshToken(),
        }),
      },
    ).then((res) => res.json())
      .then((creds) => creds.access);
  } else {
    return await fetch(
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
      .then((creds) =>
        cacheToken(creds)
          .then(() => creds.access)
      );
  }
}

// function
// using file = await Deno.open("credentials.json");
