import type { Debt, PayoffStrategy } from "../types";
import { roundToTwoDecimals } from "../utils";
import { calculatePeriodInterest } from "./interest-calculations";

interface DebtWithBalance extends Debt {
  currentBalance: number;
  minimumPayment: number;
  interestRate: number;
  interestType: "simple" | "compound" | "fixed" | "variable";
  compoundingFrequency: "daily" | "monthly" | "yearly" | null;
  paymentFrequency: "weekly" | "biweekly" | "monthly" | "yearly";
}

interface PayoffPlan {
  debtId: string;
  debtName: string;
  payoffMonth: number;
  totalPaid: number;
  interestPaid: number;
  monthlyPayments: Array<{
    month: number;
    balance: number;
    payment: number;
    principalPaid: number;
    interestPaid: number;
  }>;
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get days per period based on payment frequency
 */
function getDaysPerPeriod(
  frequency: "weekly" | "biweekly" | "monthly" | "yearly"
): number {
  switch (frequency) {
    case "weekly":
      return 7;
    case "biweekly":
      return 14;
    case "monthly":
      return 30;
    case "yearly":
      return 365;
  }
}

/**
 * Calculate minimum payment for a debt
 */
function getMinimumPayment(debt: DebtWithBalance): number {
  if (debt.minimumPayment && debt.minimumPayment > 0) {
    return debt.minimumPayment;
  }
  // Default to 2% of balance or interest + small principal
  const interestPortion = calculatePeriodInterest(
    debt.currentBalance,
    debt.interestRate,
    debt.interestType,
    debt.compoundingFrequency,
    getDaysPerPeriod(debt.paymentFrequency)
  );
  return Math.max(interestPortion * 1.1, debt.currentBalance * 0.02);
}

/**
 * Calculate snowball payoff strategy
 * Pay off smallest debts first
 */
export function calculateSnowballStrategy(
  debts: DebtWithBalance[],
  extraPayment: number = 0
): PayoffStrategy {
  // Sort by current balance (smallest first)
  const sortedDebts = [...debts]
    .filter((d) => d.currentBalance > 0)
    .sort((a, b) => a.currentBalance - b.currentBalance);

  const plans: PayoffPlan[] = [];
  let currentMonth = 0;
  let totalInterest = 0;
  let totalPayments = 0;

  for (const debt of sortedDebts) {
    const plan = calculateDebtPayoff(
      debt,
      currentMonth,
      extraPayment,
      sortedDebts.indexOf(debt) === 0 // First debt gets extra payment
    );

    plans.push(plan);
    currentMonth = plan.payoffMonth;
    totalInterest += plan.interestPaid;
    totalPayments += plan.totalPaid;

    // After this debt is paid off, extra payment goes to next debt
    if (sortedDebts.indexOf(debt) < sortedDebts.length - 1) {
      extraPayment += getMinimumPayment(debt);
    }
  }

  return {
    strategy: "snowball",
    totalMonths: currentMonth,
    totalInterest: roundToTwoDecimals(totalInterest),
    totalPayments: roundToTwoDecimals(totalPayments),
    payoffOrder: plans.map((p) => ({
      debtId: p.debtId,
      debtName: p.debtName,
      payoffMonth: p.payoffMonth,
      totalPaid: roundToTwoDecimals(p.totalPaid),
      interestPaid: roundToTwoDecimals(p.interestPaid),
    })),
  };
}

/**
 * Calculate avalanche payoff strategy
 * Pay off highest interest rate debts first
 */
export function calculateAvalancheStrategy(
  debts: DebtWithBalance[],
  extraPayment: number = 0
): PayoffStrategy {
  // Sort by interest rate (highest first), then by balance
  const sortedDebts = [...debts]
    .filter((d) => d.currentBalance > 0)
    .sort((a, b) => {
      if (b.interestRate !== a.interestRate) {
        return b.interestRate - a.interestRate;
      }
      return a.currentBalance - b.currentBalance;
    });

  const plans: PayoffPlan[] = [];
  let currentMonth = 0;
  let totalInterest = 0;
  let totalPayments = 0;

  for (const debt of sortedDebts) {
    const plan = calculateDebtPayoff(
      debt,
      currentMonth,
      extraPayment,
      sortedDebts.indexOf(debt) === 0 // First debt gets extra payment
    );

    plans.push(plan);
    currentMonth = plan.payoffMonth;
    totalInterest += plan.interestPaid;
    totalPayments += plan.totalPaid;

    // After this debt is paid off, extra payment goes to next debt
    if (sortedDebts.indexOf(debt) < sortedDebts.length - 1) {
      extraPayment += getMinimumPayment(debt);
    }
  }

  return {
    strategy: "avalanche",
    totalMonths: currentMonth,
    totalInterest: roundToTwoDecimals(totalInterest),
    totalPayments: roundToTwoDecimals(totalPayments),
    payoffOrder: plans.map((p) => ({
      debtId: p.debtId,
      debtName: p.debtName,
      payoffMonth: p.payoffMonth,
      totalPaid: roundToTwoDecimals(p.totalPaid),
      interestPaid: roundToTwoDecimals(p.interestPaid),
    })),
  };
}

/**
 * Calculate payoff plan for a single debt
 */
function calculateDebtPayoff(
  debt: DebtWithBalance,
  startMonth: number,
  extraPayment: number,
  getsExtraPayment: boolean
): PayoffPlan {
  const monthlyPayments: PayoffPlan["monthlyPayments"] = [];
  let balance = debt.currentBalance;
  let month = startMonth;
  let totalPaid = 0;
  let totalInterestPaid = 0;
  const daysPerPeriod = getDaysPerPeriod(debt.paymentFrequency);
  const periodsPerMonth = 30 / daysPerPeriod; // Approximate

  const minPayment = getMinimumPayment(debt);
  const paymentAmount = getsExtraPayment
    ? minPayment + extraPayment
    : minPayment;

  while (balance > 0.01 && month < 600) {
    // Safety limit: 50 years
    month++;

    // Calculate interest for this period
    const interestPaid = calculatePeriodInterest(
      balance,
      debt.interestRate,
      debt.interestType,
      debt.compoundingFrequency,
      daysPerPeriod
    );

    // Calculate payment split
    const actualPayment = Math.min(paymentAmount, balance + interestPaid);
    const principalPaid = Math.max(0, actualPayment - interestPaid);
    const actualInterestPaid = Math.min(interestPaid, actualPayment);

    balance = roundToTwoDecimals(balance - principalPaid);
    totalPaid += actualPayment;
    totalInterestPaid += actualInterestPaid;

    monthlyPayments.push({
      month,
      balance: roundToTwoDecimals(balance),
      payment: roundToTwoDecimals(actualPayment),
      principalPaid: roundToTwoDecimals(principalPaid),
      interestPaid: roundToTwoDecimals(actualInterestPaid),
    });
  }

  return {
    debtId: debt.id,
    debtName: debt.name,
    payoffMonth: month,
    totalPaid: roundToTwoDecimals(totalPaid),
    interestPaid: roundToTwoDecimals(totalInterestPaid),
    monthlyPayments,
  };
}

/**
 * Compare two payoff strategies
 */
export function compareStrategies(
  snowball: PayoffStrategy,
  avalanche: PayoffStrategy
): {
  fasterStrategy: "snowball" | "avalanche" | "tie";
  cheaperStrategy: "snowball" | "avalanche" | "tie";
  timeDifference: number;
  interestDifference: number;
} {
  const timeDifference = Math.abs(snowball.totalMonths - avalanche.totalMonths);
  const interestDifference = Math.abs(
    snowball.totalInterest - avalanche.totalInterest
  );

  return {
    fasterStrategy:
      snowball.totalMonths < avalanche.totalMonths
        ? "snowball"
        : snowball.totalMonths > avalanche.totalMonths
        ? "avalanche"
        : "tie",
    cheaperStrategy:
      snowball.totalInterest < avalanche.totalInterest
        ? "snowball"
        : snowball.totalInterest > avalanche.totalInterest
        ? "avalanche"
        : "tie",
    timeDifference,
    interestDifference: roundToTwoDecimals(interestDifference),
  };
}

/**
 * Calculate projected payoff date for a debt
 */
export function calculateProjectedPayoffDate(
  debt: DebtWithBalance,
  monthlyPayment: number
): Date | null {
  if (monthlyPayment <= 0) return null;

  const daysPerPeriod = getDaysPerPeriod(debt.paymentFrequency);
  let balance = debt.currentBalance;
  let days = 0;
  const maxDays = 365 * 50; // Safety limit

  while (balance > 0.01 && days < maxDays) {
    const interestPaid = calculatePeriodInterest(
      balance,
      debt.interestRate,
      debt.interestType,
      debt.compoundingFrequency,
      daysPerPeriod
    );

    const actualPayment = Math.min(monthlyPayment, balance + interestPaid);
    const principalPaid = Math.max(0, actualPayment - interestPaid);

    balance = roundToTwoDecimals(balance - principalPaid);
    days += daysPerPeriod;
  }

  if (days >= maxDays) return null;

  const payoffDate = new Date();
  payoffDate.setDate(payoffDate.getDate() + days);
  return payoffDate;
}
