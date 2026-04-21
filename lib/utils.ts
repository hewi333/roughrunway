import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sum<T>(array: T[], fn: (item: T) => number): number {
  return array.reduce((acc, item) => acc + fn(item), 0);
}

export function formatMonthLabel(startDate: string, monthOffset: number): string {
  const [year, month] = startDate.split("-").map(Number);
  const date = new Date(year, month - 1 + monthOffset - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function computeMonthDate(startDate: string, monthOffset: number): string {
  const [year, month] = startDate.split("-").map(Number);
  const date = new Date(year, month - 1 + monthOffset - 1, 1);
  return date.toISOString().split("T")[0];
}

export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}