import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import mcpServer from "./server.ts";
const transport = new StdioServerTransport();
await mcpServer.connect(transport);
