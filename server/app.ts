import { factory } from "./app-factory.ts";
import mcpHandlers from "@/mcp/streamable-http.ts";
import statementsHandlers from "@/statements/handlers.ts";

const app = factory.createApp();
app.route("/mcp", mcpHandlers);
app.route("/statements/", statementsHandlers);

export default app;
