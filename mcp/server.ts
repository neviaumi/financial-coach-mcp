import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getMonthlyStatement } from "@/open-banking/bank-statements.ts";
import * as z from "zod";

const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
});
server.registerTool("getMonthlyBankStatement", {
  title: "getMonthlyBankStatement",
  description: "Say hello to the world",
  inputSchema: {
    yearMonthCode: z.string(),
  },
  outputSchema: {
    statement: z.object({
      info: z.object({
        sum: z.string(),
      }),
      transactions: z.array(z.object({
        transactionAmount: z.object({
          amount: z.string(),
          currenct: z.string(),
        }),
        bookingDate: z.string(),
        bookingDateTime: z.string(),
        to: z.string(),
        bank: z.string(),
        accountNumber: z.string(),
        accountType: z.string(),
      })),
    }),
  },
}, async ({ yearMonthCode }) => {
  try {
    const statement = await getMonthlyStatement(yearMonthCode);
    return {
      content: [{
        "type": "text",
        text: JSON.stringify({ statement }),
      }],
      structuredContent: { statement },
    };
  } catch (e: unknown) {
    const error = e as Error;
    return {
      isError: true,
      content: [{ "type": "text", text: `Error: ${error.message}` }],
    };
  }
});
export default server;
