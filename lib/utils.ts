import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Rounds a number to 2 decimal places for calculations
 * This ensures all calculations are done with 2 decimal precision
 */
export function roundToTwoDecimals(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Formats currency with 2 decimal places for display
 * Uses Indian locale formatting
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parses a string amount and rounds it to 2 decimal places
 * Used when processing form inputs
 */
export function parseAndRoundAmount(amountString: string): number {
  const parsed = parseFloat(amountString);
  if (isNaN(parsed)) return 0;
  return roundToTwoDecimals(parsed);
}
