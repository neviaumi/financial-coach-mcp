import { factory } from "./app-factory.ts";
import { cors } from "hono/cors";
import mcpHandlers from "@/mcp/streamable-http.ts";
import statementsHandlers from "@/statements/handlers.ts";

const app = factory.createApp();
app.route("/mcp", mcpHandlers);
app.use(
  "/statements/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
app.route("/statements/", statementsHandlers);

export default app;
