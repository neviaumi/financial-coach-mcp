import app from "./app.ts";

export default {
  fetch: app.fetch,
} satisfies Deno.ServeDefaultExport;
