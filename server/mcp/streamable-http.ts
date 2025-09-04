import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import mcpServer from "./server.ts";
import { toFetchResponse, toReqRes } from "fetch-to-node";
import type { Context } from "hono";
import { factory } from "@/app-factory.ts";

const app = factory.createApp();
app.post("/", async (c: Context) => {
  const { req, res } = toReqRes(c.req.raw);
  const transport: StreamableHTTPServerTransport =
    new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
  await mcpServer.connect(transport);
  try {
    //@ts-expect-error no typing here
    await transport.handleRequest(req, res, req.body);
  } catch {
    if (!res.headersSent) {
      //@ts-expect-error no typing here
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
}).get("/", (c: Context) => {
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
}).delete("/mcp", (c: Context) => {
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

export default app;
