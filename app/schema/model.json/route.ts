import { NextResponse } from "next/server";

// JSON Schema (draft-07) for RoughRunwayModel.
// Source of truth: lib/types.ts + docs/02-DATA-MODEL.md.
//
// Served at /schema/model.json with Content-Type: application/schema+json
// so agents and tools can discover the model shape without parsing TypeScript.

export const dynamic = "force-static";

const SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://roughrunway.app/schema/model.json",
  title: "RoughRunwayModel",
  description:
    "A complete RoughRunway treasury model. Self-contained — this is what the export/import endpoints produce and consume.",
  type: "object",
  required: [
    "id",
    "name",
    "projectionMonths",
    "startDate",
    "baseCurrency",
    "extendedRunwayEnabled",
    "treasury",
    "burnCategories",
    "inflowCategories",
    "scenarios",
  ],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    projectionMonths: { type: "integer", enum: [12, 15, 18] },
    startDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}$",
      description: "YYYY-MM of the first projection month",
    },
    baseCurrency: { type: "string", enum: ["USD"] },
    extendedRunwayEnabled: { type: "boolean" },
    treasury: {
      type: "object",
      required: ["stablecoins", "fiat", "volatileAssets"],
      properties: {
        stablecoins: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "name", "amount"],
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              amount: { type: "number", minimum: 0 },
            },
          },
        },
        fiat: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "currency", "amount"],
            properties: {
              id: { type: "string" },
              currency: { type: "string", enum: ["USD", "EUR", "GBP"] },
              amount: { type: "number", minimum: 0 },
            },
          },
        },
        volatileAssets: {
          type: "array",
          items: { $ref: "#/definitions/VolatileAsset" },
        },
      },
    },
    burnCategories: {
      type: "array",
      items: { $ref: "#/definitions/BurnCategory" },
    },
    inflowCategories: {
      type: "array",
      items: { $ref: "#/definitions/InflowCategory" },
    },
    scenarios: {
      type: "array",
      items: { $ref: "#/definitions/Scenario" },
    },
  },
  definitions: {
    VolatileAsset: {
      type: "object",
      required: [
        "id",
        "name",
        "ticker",
        "tier",
        "quantity",
        "currentPrice",
        "priceSource",
        "liquidity",
        "liquidationPriority",
      ],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        ticker: { type: "string" },
        tier: { type: "string", enum: ["major", "alt", "native"] },
        quantity: { type: "number", minimum: 0 },
        currentPrice: { type: "number", minimum: 0 },
        priceSource: { type: "string", enum: ["manual", "api"] },
        liquidationPriority: {
          type: "number",
          description:
            "Lower number = liquidated first. Defaults: major=10, alt=30, native=50.",
        },
        liquidity: {
          type: "object",
          required: [
            "maxSellUnit",
            "maxSellPerMonth",
            "haircutPercent",
            "priceAssumption",
          ],
          properties: {
            maxSellUnit: {
              type: "string",
              enum: ["tokens", "percent_of_volume"],
            },
            maxSellPerMonth: { type: "number", minimum: 0 },
            percentOfVolume: { type: "number", minimum: 0, maximum: 1 },
            dailyVolume: { type: "number", minimum: 0 },
            haircutPercent: { type: "number", minimum: 0, maximum: 100 },
            priceAssumption: {
              type: "string",
              enum: ["constant", "monthly_decline", "monthly_increase"],
            },
            monthlyDeclineRate: { type: "number" },
            monthlyIncreaseRate: { type: "number" },
          },
        },
        vestingSchedule: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "month", "quantity", "description"],
            properties: {
              id: { type: "string" },
              month: { type: "integer", minimum: 1 },
              quantity: { type: "number" },
              description: { type: "string" },
            },
          },
        },
      },
    },
    BurnCategory: {
      type: "object",
      required: [
        "id",
        "name",
        "type",
        "monthlyBaseline",
        "currency",
        "growthRate",
        "adjustments",
        "isActive",
      ],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        type: { type: "string", enum: ["preset", "custom"] },
        presetKey: { type: "string" },
        monthlyBaseline: { type: "number" },
        currency: {
          type: "string",
          enum: ["fiat", "stablecoin", "native_token"],
          description: "Reserved for v2 bucket routing — v1 engine ignores this.",
        },
        growthRate: { type: "number" },
        adjustments: {
          type: "array",
          items: { $ref: "#/definitions/MonthlyAdjustment" },
        },
        isActive: { type: "boolean" },
      },
    },
    InflowCategory: {
      type: "object",
      required: [
        "id",
        "name",
        "type",
        "monthlyBaseline",
        "growthRate",
        "adjustments",
        "isActive",
      ],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        type: { type: "string", enum: ["preset", "custom"] },
        presetKey: { type: "string" },
        monthlyBaseline: { type: "number" },
        growthRate: { type: "number" },
        adjustments: {
          type: "array",
          items: { $ref: "#/definitions/MonthlyAdjustment" },
        },
        isActive: { type: "boolean" },
        denomination: {
          type: "string",
          enum: ["fiat", "token_yield"],
          description:
            'Defaults to "fiat". "token_yield" applies annualYieldPercent to the live USD value of tokenAssetId each month.',
        },
        tokenAssetId: { type: "string" },
        annualYieldPercent: { type: "number", minimum: 0 },
      },
    },
    MonthlyAdjustment: {
      type: "object",
      required: ["id", "month", "type", "amount", "description"],
      properties: {
        id: { type: "string" },
        month: { type: "integer", minimum: 1 },
        type: { type: "string", enum: ["one_off", "baseline_change"] },
        amount: { type: "number" },
        description: { type: "string" },
      },
    },
    Scenario: {
      type: "object",
      required: ["id", "name", "color", "createdAt", "isActive", "overrides"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        color: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        isActive: { type: "boolean" },
        templateKey: { type: "string" },
        overrides: { $ref: "/schema/scenario.json" },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(SCHEMA, {
    headers: {
      "Content-Type": "application/schema+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
