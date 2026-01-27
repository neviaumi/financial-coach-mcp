import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getMonthlyStatement } from "@app/bank-statement";
import { toYearMonthCode } from "@app/bank-statement/year-month-code";

import * as z from "zod";

const server = new McpServer({
  name: "financial-coach-mcp",
  version: "1.0.0",
  title: "Financial Coach",
});

server.registerPrompt("analysisMonthlyFincianePerformance", {
  title: "analysisMonthlyFincianePerformance",
  description:
    "Analysis the transaction on statement and advise the thing can be in order to get more saving and cut unensscary expense.",
  argsSchema: {
    yearMonthCode: z.string().describe(
      "The year-month code in YYYYMmm format (e.g., '2023M01'), matching the regex /^\d{4}M\d{2}$/",
    ),
  },
}, ({ yearMonthCode }) => {
  return {
    messages: [
      {
        "role": "user",
        content: {
          "type": "text",
          "text":
            `As a financial coach, your primary goal is to help me optimize my finances.
Please use the \`getMonthlyBankStatement\` tool from the \`financial-coach-mcp\` server, providing it with \`${yearMonthCode}\` as the \`yearMonthCode\`.
Once you have retrieved the monthly bank statement, meticulously analyze my expenses.
Then, provide actionable advice on:
- Strategies to reduce unnecessary expenses.
- Effective methods to increase my savings.`,
        },
      },
    ],
  };
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
      balance: z.object({
        opening: z.object({
          amount: z.string(),
          currency: z.string(),
        }).describe(
          "The opening balance for this statement. Currently, this value is set to 0 as historical statement tracking functionality is not yet implemented.",
        ),
        closing: z.object({
          amount: z.string(),
          currency: z.string(),
        }).describe(
          "The closing balance for this statement. A positive amount indicates savings for the month, while a negative amount indicates overspending.",
        ),
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
          institution: z.object(
            {
              id: z.string(),
              accountNumber: z.string(),
              accountType: z.string(),
            },
          ),
        }).passthrough(),
      ),
    }),
  },
}, async ({ yearMonthCode }) => {
  try {
    const statement = await getMonthlyStatement(toYearMonthCode(yearMonthCode));
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
