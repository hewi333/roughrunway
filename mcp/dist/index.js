#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const BASE_URL = process.env.ROUGHRUNWAY_URL ?? "https://roughrunway.com";
const server = new McpServer({
    name: "roughrunway",
    version: "1.0.0",
    description: "Build crypto treasury runway models and get a shareable link",
});
server.tool("build_runway_model", `Build a crypto treasury runway model on roughrunway.com and return a shareable link.

Parse the user's description and fill in the parameters below.
Tier rules: BTC/ETH/WBTC = "major", the org's own token = "native", everything else = "alt".
If only a total burn is given, pass it as a single number; headcount = team × $15,000/month.`, {
    name: z
        .string()
        .describe('Short project or team name, e.g. "DeFi Team"'),
    stablecoins: z
        .string()
        .optional()
        .describe('Stablecoin balances as NAME:AMOUNT pairs, comma-separated. e.g. "USDC:1500000,USDT:200000"'),
    volatile: z
        .string()
        .optional()
        .describe('Volatile crypto holdings as TICKER:QTY:PRICE:TIER, comma-separated. e.g. "ETH:50:3500:major,NEX:100000000:0.08:native"'),
    burn: z
        .string()
        .optional()
        .describe('Monthly burn — single number ("150000") or category:amount pairs ("headcount:105000,infrastructure:18000")'),
    team: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Team headcount. Headcount cost is automatically computed as team × $15,000/month"),
    months: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Projection horizon in months (default 12)"),
}, async ({ name, stablecoins, volatile, burn, team, months }) => {
    const params = new URLSearchParams({ name });
    if (stablecoins)
        params.set("stable", stablecoins);
    if (volatile)
        params.set("volatile", volatile);
    if (burn)
        params.set("burn", burn);
    if (team)
        params.set("team", String(team));
    if (months)
        params.set("months", String(months));
    let res;
    try {
        res = await fetch(`${BASE_URL}/api/agent/encode?${params.toString()}`);
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Network error reaching RoughRunway: ${err}` }],
            isError: true,
        };
    }
    if (!res.ok) {
        const body = await res.text().catch(() => res.statusText);
        return {
            content: [{ type: "text", text: `RoughRunway returned an error (${res.status}): ${body}` }],
            isError: true,
        };
    }
    const { shareUrl, modelName } = (await res.json());
    return {
        content: [
            {
                type: "text",
                text: `Here's your RoughRunway model for **${modelName}**:\n\n${shareUrl}\n\nClick the link to explore your interactive treasury dashboard — projected runway, scenario analysis, and funding gap breakdown.`,
            },
        ],
    };
});
const transport = new StdioServerTransport();
await server.connect(transport);
