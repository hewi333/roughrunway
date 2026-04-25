import { describe, it, expect } from "vitest";
import {
  validateTreasuryPatchClient,
  validateBurnPatchClient,
  validateInflowPatchClient,
  validatePriceSetClient,
} from "@/lib/patch-validators";

describe("validateTreasuryPatchClient", () => {
  it("accepts a well-formed patch", () => {
    const patch = validateTreasuryPatchClient({
      stablecoins: [{ id: "abc", name: "USDC", amount: 1000 }],
      fiat: [{ currency: "USD", amount: 500 }],
      volatileAssets: [
        {
          id: "eth-id",
          name: "Ethereum",
          ticker: "ETH",
          tier: "major",
          quantity: 10,
          currentPrice: 3500,
        },
      ],
    });
    expect(patch).not.toBeNull();
    expect(patch?.stablecoins?.[0].amount).toBe(1000);
    expect(patch?.volatileAssets?.[0].ticker).toBe("ETH");
  });

  it("rejects invalid tier", () => {
    expect(
      validateTreasuryPatchClient({
        volatileAssets: [
          {
            name: "X",
            ticker: "X",
            tier: "bogus",
            quantity: 1,
            currentPrice: 1,
          },
        ],
      })
    ).toBeNull();
  });

  it("rejects negative amount", () => {
    expect(
      validateTreasuryPatchClient({
        stablecoins: [{ name: "USDC", amount: -1 }],
      })
    ).toBeNull();
  });

  it("rejects non-finite numbers", () => {
    expect(
      validateTreasuryPatchClient({
        stablecoins: [{ name: "USDC", amount: Infinity }],
      })
    ).toBeNull();
  });

  it("rejects unexpected currency", () => {
    expect(
      validateTreasuryPatchClient({
        fiat: [{ currency: "JPY", amount: 100 }],
      })
    ).toBeNull();
  });

  it("caps arrays and doesn't throw on huge input", () => {
    const huge = {
      stablecoins: Array.from({ length: 1000 }, (_, i) => ({
        name: `s${i}`,
        amount: i,
      })),
    };
    const result = validateTreasuryPatchClient(huge);
    expect(result?.stablecoins?.length).toBe(50);
  });

  it("returns null for non-object input", () => {
    expect(validateTreasuryPatchClient(null)).toBeNull();
    expect(validateTreasuryPatchClient("nope")).toBeNull();
    expect(validateTreasuryPatchClient([])).toBeNull();
  });
});

describe("validateBurnPatchClient", () => {
  it("accepts a well-formed patch", () => {
    const patch = validateBurnPatchClient({
      burnCategories: [
        { id: "a", name: "Marketing", monthlyBaseline: 10000, isActive: true },
        { name: "Legal", presetKey: "legal", monthlyBaseline: 5000 },
      ],
    });
    expect(patch?.burnCategories).toHaveLength(2);
    expect(patch?.burnCategories[1].presetKey).toBe("legal");
  });

  it("rejects missing name", () => {
    expect(
      validateBurnPatchClient({
        burnCategories: [{ monthlyBaseline: 100 }],
      })
    ).toBeNull();
  });

  it("rejects invalid growthRate", () => {
    expect(
      validateBurnPatchClient({
        burnCategories: [{ name: "X", monthlyBaseline: 100, growthRate: 999 }],
      })
    ).toBeNull();
  });
});

describe("validateInflowPatchClient", () => {
  it("accepts inflowCategories key", () => {
    const patch = validateInflowPatchClient({
      inflowCategories: [{ name: "Revenue", monthlyBaseline: 100000 }],
    });
    expect(patch?.inflowCategories).toHaveLength(1);
  });

  it("rejects patch keyed as burnCategories (wrong scope)", () => {
    expect(
      validateInflowPatchClient({
        burnCategories: [{ name: "Revenue", monthlyBaseline: 100000 }],
      })
    ).toBeNull();
  });
});

describe("validatePriceSetClient", () => {
  it("uppercases tickers", () => {
    const result = validatePriceSetClient({
      prices: [{ ticker: "btc", price: 90000 }],
    });
    expect(result?.prices[0].ticker).toBe("BTC");
  });

  it("rejects negative prices", () => {
    expect(
      validatePriceSetClient({ prices: [{ ticker: "BTC", price: -1 }] })
    ).toBeNull();
  });

  it("rejects empty ticker", () => {
    expect(
      validatePriceSetClient({ prices: [{ ticker: "", price: 1 }] })
    ).toBeNull();
  });
});
