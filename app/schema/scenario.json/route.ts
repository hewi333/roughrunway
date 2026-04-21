import { NextResponse } from "next/server";

// JSON Schema (draft-07) for ScenarioOverrides.
// Source of truth: lib/types.ts §ScenarioOverrides + skills/run-scenario/SKILL.md.

export const dynamic = "force-static";

const SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://roughrunway.com/schema/scenario.json",
  title: "ScenarioOverrides",
  description:
    "Diff against a baseline RoughRunwayModel. Only fields present are applied; everything else inherits from the baseline. Used for scenario analysis without mutating the baseline.",
  type: "object",
  properties: {
    priceOverrides: {
      type: "array",
      items: {
        type: "object",
        required: ["assetId", "type", "value"],
        properties: {
          assetId: {
            type: "string",
            description:
              "ID of a specific volatile asset, or the literal string 'all_volatile' to apply to every volatile asset.",
          },
          type: { type: "string", enum: ["absolute", "percent_change"] },
          value: {
            type: "number",
            description:
              "For 'absolute': new USD price. For 'percent_change': decimal (-0.4 = -40%).",
          },
        },
      },
    },
    burnOverrides: {
      type: "array",
      items: {
        type: "object",
        required: ["categoryId", "type"],
        properties: {
          categoryId: { type: "string" },
          type: {
            type: "string",
            enum: ["percent_change", "absolute", "disable"],
          },
          value: { type: "number" },
          startMonth: { type: "integer", minimum: 1 },
        },
      },
    },
    inflowOverrides: {
      type: "array",
      items: {
        type: "object",
        required: ["categoryId", "type"],
        properties: {
          categoryId: { type: "string" },
          type: {
            type: "string",
            enum: ["percent_change", "absolute", "disable"],
          },
          value: { type: "number" },
          startMonth: { type: "integer", minimum: 1 },
        },
      },
    },
    liquidityOverrides: {
      type: "array",
      items: {
        type: "object",
        required: ["assetId"],
        properties: {
          assetId: { type: "string" },
          haircutPercent: { type: "number", minimum: 0, maximum: 100 },
          maxSellPerMonth: { type: "number", minimum: 0 },
          percentOfVolume: { type: "number", minimum: 0, maximum: 1 },
        },
      },
    },
    additionalBurnEvents: {
      type: "array",
      items: { $ref: "#/definitions/OneOffEvent" },
    },
    additionalInflowEvents: {
      type: "array",
      items: { $ref: "#/definitions/OneOffEvent" },
    },
    headcountChange: {
      type: "object",
      required: ["count", "costPerHead", "startMonth"],
      properties: {
        count: {
          type: "integer",
          description:
            "Positive to add headcount, negative to remove. Applied as a baseline_change to the headcount burn category.",
        },
        costPerHead: { type: "number", minimum: 0 },
        startMonth: { type: "integer", minimum: 1 },
      },
    },
  },
  definitions: {
    OneOffEvent: {
      type: "object",
      required: ["month", "amount", "description"],
      properties: {
        month: { type: "integer", minimum: 1 },
        amount: { type: "number", minimum: 0 },
        description: { type: "string" },
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
