// Runtime validation for patches returned from /api/ai/parse-edit before we
// write them into the zustand store. The server already validates, but we
// re-check client-side so:
//   (a) a compromised/spoofed response can't poison the store,
//   (b) we stay defensive if the API contract drifts.
//
// These shapes mirror lib/ai-guards.ts server-side validators.

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isFiniteNumber(x: unknown, min = -Infinity, max = Infinity): x is number {
  return typeof x === "number" && Number.isFinite(x) && x >= min && x <= max;
}

function isNonEmptyString(x: unknown, max = 200): x is string {
  return typeof x === "string" && x.length > 0 && x.length <= max;
}

export interface ValidatedTreasuryPatchShape {
  stablecoins?: { id?: string; name: string; amount: number }[];
  fiat?: { id?: string; currency: "USD" | "EUR" | "GBP"; amount: number }[];
  volatileAssets?: {
    id?: string;
    name: string;
    ticker: string;
    tier: "major" | "alt" | "native";
    quantity: number;
    currentPrice: number;
    liquidationPriority?: number;
    haircutPercent?: number;
  }[];
}

export function validateTreasuryPatchClient(raw: unknown): ValidatedTreasuryPatchShape | null {
  if (!isRecord(raw)) return null;
  const out: ValidatedTreasuryPatchShape = {};

  if (Array.isArray(raw.stablecoins)) {
    const list: NonNullable<ValidatedTreasuryPatchShape["stablecoins"]> = [];
    for (const item of raw.stablecoins.slice(0, 50)) {
      if (!isRecord(item)) return null;
      if (!isNonEmptyString(item.name)) return null;
      if (!isFiniteNumber(item.amount, 0, 1e15)) return null;
      list.push({
        id: typeof item.id === "string" ? item.id : undefined,
        name: item.name,
        amount: item.amount,
      });
    }
    out.stablecoins = list;
  }

  if (Array.isArray(raw.fiat)) {
    const list: NonNullable<ValidatedTreasuryPatchShape["fiat"]> = [];
    for (const item of raw.fiat.slice(0, 50)) {
      if (!isRecord(item)) return null;
      if (item.currency !== "USD" && item.currency !== "EUR" && item.currency !== "GBP") return null;
      if (!isFiniteNumber(item.amount, 0, 1e15)) return null;
      list.push({
        id: typeof item.id === "string" ? item.id : undefined,
        currency: item.currency,
        amount: item.amount,
      });
    }
    out.fiat = list;
  }

  if (Array.isArray(raw.volatileAssets)) {
    const list: NonNullable<ValidatedTreasuryPatchShape["volatileAssets"]> = [];
    for (const item of raw.volatileAssets.slice(0, 50)) {
      if (!isRecord(item)) return null;
      if (!isNonEmptyString(item.name)) return null;
      if (!isNonEmptyString(item.ticker, 20)) return null;
      if (item.tier !== "major" && item.tier !== "alt" && item.tier !== "native") return null;
      if (!isFiniteNumber(item.quantity, 0, 1e18)) return null;
      if (!isFiniteNumber(item.currentPrice, 0, 1e12)) return null;
      const liquidationPriority =
        item.liquidationPriority !== undefined
          ? isFiniteNumber(item.liquidationPriority, 1, 100)
            ? item.liquidationPriority
            : null
          : undefined;
      const haircutPercent =
        item.haircutPercent !== undefined
          ? isFiniteNumber(item.haircutPercent, 0, 99)
            ? item.haircutPercent
            : null
          : undefined;
      if (liquidationPriority === null || haircutPercent === null) return null;
      list.push({
        id: typeof item.id === "string" ? item.id : undefined,
        name: item.name,
        ticker: item.ticker,
        tier: item.tier,
        quantity: item.quantity,
        currentPrice: item.currentPrice,
        ...(liquidationPriority !== undefined ? { liquidationPriority } : {}),
        ...(haircutPercent !== undefined ? { haircutPercent } : {}),
      });
    }
    out.volatileAssets = list;
  }

  return out;
}

export interface ValidatedCategoryPatchItem {
  id?: string;
  name: string;
  presetKey?: string;
  monthlyBaseline: number;
  growthRate?: number;
  isActive?: boolean;
}

function validateCategoryArray(raw: unknown): ValidatedCategoryPatchItem[] | null {
  if (!Array.isArray(raw)) return null;
  const list: ValidatedCategoryPatchItem[] = [];
  for (const item of raw.slice(0, 50)) {
    if (!isRecord(item)) return null;
    if (!isNonEmptyString(item.name)) return null;
    if (!isFiniteNumber(item.monthlyBaseline, 0, 1e12)) return null;
    const growthRate =
      item.growthRate !== undefined
        ? isFiniteNumber(item.growthRate, -1, 10)
          ? item.growthRate
          : null
        : undefined;
    if (growthRate === null) return null;
    list.push({
      id: typeof item.id === "string" ? item.id : undefined,
      name: item.name,
      presetKey: typeof item.presetKey === "string" ? item.presetKey : undefined,
      monthlyBaseline: item.monthlyBaseline,
      ...(growthRate !== undefined ? { growthRate } : {}),
      ...(typeof item.isActive === "boolean" ? { isActive: item.isActive } : {}),
    });
  }
  return list;
}

export interface ValidatedBurnPatchShape {
  burnCategories: ValidatedCategoryPatchItem[];
}

export function validateBurnPatchClient(raw: unknown): ValidatedBurnPatchShape | null {
  if (!isRecord(raw)) return null;
  const list = validateCategoryArray(raw.burnCategories);
  return list ? { burnCategories: list } : null;
}

export interface ValidatedInflowPatchShape {
  inflowCategories: ValidatedCategoryPatchItem[];
}

export function validateInflowPatchClient(raw: unknown): ValidatedInflowPatchShape | null {
  if (!isRecord(raw)) return null;
  const list = validateCategoryArray(raw.inflowCategories);
  return list ? { inflowCategories: list } : null;
}

export interface ValidatedPriceSetShape {
  prices: { ticker: string; price: number }[];
}

export function validatePriceSetClient(raw: unknown): ValidatedPriceSetShape | null {
  if (!isRecord(raw)) return null;
  if (!Array.isArray(raw.prices)) return null;
  const list: ValidatedPriceSetShape["prices"] = [];
  for (const item of raw.prices.slice(0, 50)) {
    if (!isRecord(item)) return null;
    if (!isNonEmptyString(item.ticker, 20)) return null;
    if (!isFiniteNumber(item.price, 0, 1e12)) return null;
    list.push({ ticker: item.ticker.toUpperCase(), price: item.price });
  }
  return { prices: list };
}
