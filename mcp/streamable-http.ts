import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import mcpServer from "./server.ts";
import { toFetchResponse, toReqRes } from "fetch-to-node";
import { Context, Hono } from "hono";

const app = new Hono();
app.post("/mcp", async (c: Context) => {
  const { req, res } = toReqRes(c.req.raw);
  const transport: StreamableHTTPServerTransport =
    new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
  await mcpServer.connect(transport);
  try {
    await transport.handleRequest(req, res, req.body);
  } catch {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
  return toFetchResponse(res);
});
app.get("/mcp", (c: Context) => {
  const { res } = toReqRes(c.req.raw);
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed.",
    },
    id: null,
  }));
  return toFetchResponse(res);
});
app.delete("/mcp", (c: Context) => {
  const { res } = toReqRes(c.req.raw);
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed.",
    },
    id: null,
  }));
  return toFetchResponse(res);
});

export default {
  fetch: app.fetch,
} satisfies Deno.ServeDefaultExport;
