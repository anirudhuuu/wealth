import type { InterestCalculation } from "../types";
import { roundToTwoDecimals } from "../utils";

/**
 * Calculate simple interest
 * Formula: Interest = Principal × Rate × Time
 */
export function calculateSimpleInterest(
  principal: number,
  rate: number,
  timeInYears: number
): number {
  return roundToTwoDecimals((principal * rate * timeInYears) / 100);
}

/**
 * Calculate compound interest
 * Formula: A = P(1 + r/n)^(nt)
 * Where:
 * - A = final amount
 * - P = principal
 * - r = annual rate (as decimal)
 * - n = compounding frequency per year
 * - t = time in years
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  timeInYears: number,
  compoundingFrequency: "daily" | "monthly" | "yearly"
): number {
  const r = rate / 100; // Convert percentage to decimal
  let n: number;

  switch (compoundingFrequency) {
    case "daily":
      n = 365;
      break;
    case "monthly":
      n = 12;
      break;
    case "yearly":
      n = 1;
      break;
  }

  const amount = principal * Math.pow(1 + r / n, n * timeInYears);
  const interest = amount - principal;

  return roundToTwoDecimals(interest);
}

/**
 * Calculate interest for a specific period (e.g., monthly interest)
 */
export function calculatePeriodInterest(
  principal: number,
  rate: number,
  interestType: "simple" | "compound" | "fixed" | "variable",
  compoundingFrequency: "daily" | "monthly" | "yearly" | null,
  periodInDays: number
): number {
  const timeInYears = periodInDays / 365;

  if (interestType === "simple" || interestType === "fixed") {
    return calculateSimpleInterest(principal, rate, timeInYears);
  } else if (interestType === "compound") {
    if (!compoundingFrequency) {
      // Default to monthly if not specified
      return calculateCompoundInterest(principal, rate, timeInYears, "monthly");
    }
    return calculateCompoundInterest(
      principal,
      rate,
      timeInYears,
      compoundingFrequency
    );
  } else {
    // Variable interest - use simple for now (could be enhanced with rate history)
    return calculateSimpleInterest(principal, rate, timeInYears);
  }
}

/**
 * Calculate interest breakdown over multiple periods
 */
export function calculateInterestBreakdown(
  principal: number,
  rate: number,
  interestType: "simple" | "compound" | "fixed" | "variable",
  compoundingFrequency: "daily" | "monthly" | "yearly" | null,
  numberOfPeriods: number,
  periodInDays: number = 30
): InterestCalculation {
  const breakdown: Array<{
    period: number;
    principal: number;
    interest: number;
    total: number;
  }> = [];

  let currentPrincipal = principal;
  let totalInterest = 0;

  for (let period = 1; period <= numberOfPeriods; period++) {
    const interest = calculatePeriodInterest(
      currentPrincipal,
      rate,
      interestType,
      compoundingFrequency,
      periodInDays
    );

    totalInterest += interest;
    const total = currentPrincipal + interest;

    breakdown.push({
      period,
      principal: roundToTwoDecimals(currentPrincipal),
      interest: roundToTwoDecimals(interest),
      total: roundToTwoDecimals(total),
    });

    // For compound interest, add interest to principal for next period
    if (interestType === "compound") {
      currentPrincipal = total;
    }
  }

  return {
    principal,
    rate,
    timeInYears: (numberOfPeriods * periodInDays) / 365,
    interestAmount: roundToTwoDecimals(totalInterest),
    totalAmount: roundToTwoDecimals(principal + totalInterest),
    breakdown,
  };
}

/**
 * Calculate interest portion of a payment
 * This determines how much of a payment goes to interest vs principal
 */
export function calculatePaymentInterestPortion(
  currentBalance: number,
  rate: number,
  interestType: "simple" | "compound" | "fixed" | "variable",
  compoundingFrequency: "daily" | "monthly" | "yearly" | null,
  daysSinceLastPayment: number
): number {
  return calculatePeriodInterest(
    currentBalance,
    rate,
    interestType,
    compoundingFrequency,
    daysSinceLastPayment
  );
}

/**
 * Calculate principal and interest split for a payment
 */
export function calculatePaymentSplit(
  paymentAmount: number,
  currentBalance: number,
  rate: number,
  interestType: "simple" | "compound" | "fixed" | "variable",
  compoundingFrequency: "daily" | "monthly" | "yearly" | null,
  daysSinceLastPayment: number
): { principalPaid: number; interestPaid: number } {
  const interestPaid = Math.min(
    calculatePaymentInterestPortion(
      currentBalance,
      rate,
      interestType,
      compoundingFrequency,
      daysSinceLastPayment
    ),
    paymentAmount
  );

  const principalPaid = roundToTwoDecimals(
    Math.max(0, paymentAmount - interestPaid)
  );

  return {
    principalPaid,
    interestPaid: roundToTwoDecimals(interestPaid),
  };
}

/**
 * Project future interest if no payments are made
 */
export function projectFutureInterest(
  currentBalance: number,
  rate: number,
  interestType: "simple" | "compound" | "fixed" | "variable",
  compoundingFrequency: "daily" | "monthly" | "yearly" | null,
  monthsAhead: number
): number {
  const timeInYears = monthsAhead / 12;

  if (interestType === "simple" || interestType === "fixed") {
    return calculateSimpleInterest(currentBalance, rate, timeInYears);
  } else if (interestType === "compound") {
    if (!compoundingFrequency) {
      return calculateCompoundInterest(
        currentBalance,
        rate,
        timeInYears,
        "monthly"
      );
    }
    return calculateCompoundInterest(
      currentBalance,
      rate,
      timeInYears,
      compoundingFrequency
    );
  } else {
    return calculateSimpleInterest(currentBalance, rate, timeInYears);
  }
}
