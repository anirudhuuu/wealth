import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
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
export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parses a string amount and rounds it to 2 decimal places
 * Used when processing form inputs
 */
export function parseAndRoundAmount(amountString: string | number): number {
  const num = typeof amountString === "string" ? parseFloat(amountString) : amountString;
  if (isNaN(num)) {
    throw new Error("Invalid amount format");
  }
  return roundToTwoDecimals(num);
}

/**
 * Date formatting utilities
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM dd, yyyy");
}

export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "yyyy-MM-dd");
}

/**
 * Converts a Date object to YYYY-MM-DD format in IST timezone
 * This prevents timezone conversion issues when storing dates
 */
export function formatDateForDatabase(date: Date): string {
  // Get the date components in local timezone (IST)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Creates a Date object from a database date string (YYYY-MM-DD)
 * This ensures the date is interpreted in IST timezone
 */
export function parseDateFromDatabase(dateString: string): Date {
  // Validate the date string format
  if (!dateString || typeof dateString !== "string") {
    throw new Error("Invalid date string provided");
  }

  // Check if the date string matches YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    throw new Error("Date string must be in YYYY-MM-DD format");
  }

  // Parse the date string and create a Date object in local timezone
  const [year, month, day] = dateString.split("-").map(Number);

  // Validate the parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error("Invalid date components");
  }

  // Create the date and validate it's a valid date
  const date = new Date(year, month - 1, day);

  // Check if the created date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date;
}

/**
 * Validation utilities
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && !isNaN(amount);
}

export function validateDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * String utilities
 */
export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, " ");
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Performance utilities
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Calculation utilities
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return roundToTwoDecimals(((newValue - oldValue) / oldValue) * 100);
}

export function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0;

  const firstValue = values[0];
  const lastValue = values[values.length - 1];

  return calculatePercentageChange(firstValue, lastValue);
}

/**
 * Array utilities
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

export function filterByDateRange<T extends { date: string }>(
  items: T[],
  startDate: Date,
  endDate: Date
): T[] {
  return items.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Date range utilities
 */
export function getDateRange(period: "week" | "month" | "quarter" | "year"): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(now.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  return { start, end };
}
