// CryptoRunway Utility Functions

export function generateId(prefix: string = ""): string {
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${uuid.replace(/-/g, "").slice(0, 12)}` : uuid;
}

export function sum<T>(arr: T[], fn: (item: T) => number): number {
  return arr.reduce((acc, item) => acc + fn(item), 0);
}

export function formatMonthLabel(startDate: string, monthOffset: number): string {
  const [year, monthNum] = startDate.split("-").map(Number);
  const date = new Date(year, monthNum - 1 + monthOffset - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function computeMonthDate(startDate: string, monthOffset: number): string {
  const [year, monthNum] = startDate.split("-").map(Number);
  const date = new Date(year, monthNum - 1 + monthOffset - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function nextMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return formatCurrency(amount);
}

export function formatPercent(decimal: number): string {
  const pct = decimal * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function formatTokenQuantity(quantity: number): string {
  if (Math.abs(quantity) >= 1) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(quantity);
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(quantity);
}

export type RunwayHealth = "healthy" | "caution" | "danger";

export function runwayHealth(months: number | null): RunwayHealth {
  if (months === null) return "healthy";
  if (months >= 12) return "healthy";
  if (months >= 6) return "caution";
  return "danger";
}

export function formatRunwayMonths(months: number | null, horizon: number): string {
  if (months === null) return `${horizon}+ months`;
  return `${months} month${months === 1 ? "" : "s"}`;
}
