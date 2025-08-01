import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getMonthlyStatement } from "@/open-banking/bank-statements.ts";
import * as z from "zod";

const server = new McpServer({
  name: "financial-coach-mcp",
  version: "1.0.0",
  title: "Financial Coach",
});
server.registerTool("getMonthlyBankStatement", {
  title: "getMonthlyBankStatement",
  description:
    "Retrieves the monthly bank statement for a specified year and month code.",
  inputSchema: {
    yearMonthCode: z.string().describe(
      "The year-month code in YYYYMmm format (e.g., '2023M01'), matching the regex /^\d{4}M\d{2}$/",
    ),
  },
  outputSchema: {
    statement: z.object({
      info: z.object({
        sum: z.string(),
      }),
      transactions: z.array(
        z.object({
          transactionAmount: z.object({
            amount: z.string(),
            currency: z.string(),
          }),
          bookingDate: z.string(),
          bookingDateTime: z.string(),
          to: z.string(),
          bank: z.string(),
          accountNumber: z.string(),
          accountType: z.string(),
        }).passthrough(),
      ),
    }),
  },
}, async ({ yearMonthCode }: {
  yearMonthCode: string;
}) => {
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
