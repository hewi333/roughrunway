// JSON Schemas for Perplexity structured output.
// These must stay in sync with lib/types.ts.

export const SCENARIO_OVERRIDES_JSON_SCHEMA = {
  type: "object",
  properties: {
    priceOverrides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          assetId: { type: "string", description: "Asset UUID, 'all_volatile', or tier name (major/alt/native)" },
          type: { type: "string", enum: ["absolute", "percent_change"] },
          value: { type: "number", description: "Absolute price in USD, or fraction (e.g. -0.5 = -50%)" },
        },
        required: ["assetId", "type", "value"],
      },
    },
    burnOverrides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          categoryId: { type: "string", description: "Category UUID or presetKey" },
          type: { type: "string", enum: ["percent_change", "absolute", "disable"] },
          value: { type: "number" },
          startMonth: { type: "number" },
        },
        required: ["categoryId", "type"],
      },
    },
    inflowOverrides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          categoryId: { type: "string", description: "Category UUID or presetKey" },
          type: { type: "string", enum: ["percent_change", "absolute", "disable"] },
          value: { type: "number" },
          startMonth: { type: "number" },
        },
        required: ["categoryId", "type"],
      },
    },
    liquidityOverrides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          assetId: { type: "string" },
          haircutPercent: { type: "number", minimum: 0, maximum: 99 },
          maxSellPerMonth: { type: "number", minimum: 0 },
          percentOfVolume: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["assetId"],
      },
    },
    additionalBurnEvents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          month: { type: "number", minimum: 1 },
          amount: { type: "number", minimum: 0 },
          description: { type: "string" },
        },
        required: ["month", "amount", "description"],
      },
    },
    additionalInflowEvents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          month: { type: "number", minimum: 1 },
          amount: { type: "number", minimum: 0 },
          description: { type: "string" },
        },
        required: ["month", "amount", "description"],
      },
    },
    headcountChange: {
      type: "object",
      properties: {
        count: { type: "number", description: "Positive = hire, negative = layoff" },
        costPerHead: { type: "number", minimum: 0, description: "Monthly cost per person in USD" },
        startMonth: { type: "number", minimum: 1 },
      },
      required: ["count", "costPerHead", "startMonth"],
    },
  },
};

// Simplified schema for the setup assistant response.
// IDs, updatedAt, etc. are added client-side after parsing.
export const PARSED_SETUP_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string", description: "Short org/project name, max 50 chars" },
    projectionMonths: { type: "number", enum: [12, 15, 18] },
    startDate: { type: "string", description: "Current month in YYYY-MM format" },
    treasury: {
      type: "object",
      properties: {
        stablecoins: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              amount: { type: "number", minimum: 0 },
            },
            required: ["name", "amount"],
          },
        },
        fiat: {
          type: "array",
          items: {
            type: "object",
            properties: {
              currency: { type: "string", enum: ["USD", "EUR", "GBP"] },
              amount: { type: "number", minimum: 0 },
            },
            required: ["currency", "amount"],
          },
        },
        volatileAssets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              ticker: { type: "string" },
              tier: { type: "string", enum: ["major", "alt", "native"] },
              quantity: { type: "number", minimum: 0 },
              currentPrice: { type: "number", minimum: 0 },
              liquidationPriority: { type: "number", minimum: 1, maximum: 100 },
              haircutPercent: { type: "number", minimum: 0, maximum: 99 },
            },
            required: ["name", "ticker", "tier", "quantity", "currentPrice"],
          },
        },
      },
    },
    burnCategories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          presetKey: { type: "string" },
          name: { type: "string" },
          monthlyBaseline: { type: "number", minimum: 0 },
          growthRate: { type: "number" },
        },
        required: ["monthlyBaseline"],
      },
    },
    inflowCategories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          presetKey: { type: "string" },
          name: { type: "string" },
          monthlyBaseline: { type: "number", minimum: 0 },
          growthRate: { type: "number" },
        },
        required: ["monthlyBaseline"],
      },
    },
    summary: { type: "string" },
  },
  required: ["summary"],
};

// ─── Edit schemas ────────────────────────────────────────────────────────────
// Used by /api/ai/parse-edit to let the user modify a slice (treasury / burn)
// of an existing model in natural language. The LLM returns the COMPLETE
// desired state of the slice post-edit, preserving IDs of items it kept.

export const TREASURY_EDIT_SCHEMA = {
  type: "object",
  properties: {
    patch: {
      type: "object",
      properties: {
        stablecoins: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Existing id — omit for new items" },
              name: { type: "string" },
              amount: { type: "number", minimum: 0 },
            },
            required: ["name", "amount"],
          },
        },
        fiat: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              currency: { type: "string", enum: ["USD", "EUR", "GBP"] },
              amount: { type: "number", minimum: 0 },
            },
            required: ["currency", "amount"],
          },
        },
        volatileAssets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              ticker: { type: "string" },
              tier: { type: "string", enum: ["major", "alt", "native"] },
              quantity: { type: "number", minimum: 0 },
              currentPrice: { type: "number", minimum: 0 },
              liquidationPriority: { type: "number", minimum: 1, maximum: 100 },
              haircutPercent: { type: "number", minimum: 0, maximum: 99 },
            },
            required: ["name", "ticker", "tier", "quantity", "currentPrice"],
          },
        },
      },
    },
    summary: { type: "string" },
  },
  required: ["patch", "summary"],
};

export const BURN_EDIT_SCHEMA = {
  type: "object",
  properties: {
    patch: {
      type: "object",
      properties: {
        burnCategories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Existing id — omit for new items" },
              name: { type: "string" },
              presetKey: { type: "string" },
              monthlyBaseline: { type: "number", minimum: 0 },
              growthRate: { type: "number" },
              isActive: { type: "boolean" },
            },
            required: ["name", "monthlyBaseline"],
          },
        },
      },
      required: ["burnCategories"],
    },
    summary: { type: "string" },
  },
  required: ["patch", "summary"],
};
