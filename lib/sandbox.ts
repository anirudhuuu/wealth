import type { Asset, Ledger, Transaction } from "@/lib/types";
import { roundToTwoDecimals } from "@/lib/utils";

// Sandbox mode: Generate dummy data for non-admin users
export function generateSandboxLedgers(): Ledger[] {
  return [
    {
      id: "sandbox-1",
      user_id: "sandbox",
      name: "Family Budget",
      type: "family",
      currency: "INR",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "sandbox-2",
      user_id: "sandbox",
      name: "Personal Expenses",
      type: "personal",
      currency: "INR",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export function generateSandboxTransactions(): Transaction[] {
  const today = new Date();
  const transactions: Transaction[] = [];

  // Generate 30 days of sample transactions
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Add 2-3 transactions per day
    const numTransactions = Math.floor(Math.random() * 2) + 2;
    for (let j = 0; j < numTransactions; j++) {
      const isIncome = Math.random() > 0.7;
      transactions.push({
        id: `sandbox-txn-${i}-${j}`,
        user_id: "sandbox",
        ledger_id: Math.random() > 0.5 ? "sandbox-1" : "sandbox-2",
        date: date.toISOString().split("T")[0],
        description: isIncome
          ? ["Salary", "Freelance Payment", "Investment Return"][
              Math.floor(Math.random() * 3)
            ]
          : [
              "Groceries",
              "Utilities",
              "Transportation",
              "Entertainment",
              "Healthcare",
            ][Math.floor(Math.random() * 5)],
        category: isIncome
          ? ["Salary", "Freelance", "Investment"][Math.floor(Math.random() * 3)]
          : ["Food", "Bills", "Transport", "Entertainment", "Health"][
              Math.floor(Math.random() * 5)
            ],
        amount: isIncome
          ? Math.floor(Math.random() * 50000) + 10000
          : Math.floor(Math.random() * 5000) + 500,
        type: isIncome ? "income" : "expense",
        notes: null,
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
      });
    }
  }

  return transactions;
}

export function generateSandboxAssets(): Asset[] {
  return [
    {
      id: "sandbox-asset-1",
      user_id: "sandbox",
      name: "Fixed Deposit - Bank A",
      type: "fd",
      current_value: 500000,
      purchase_value: 500000,
      purchase_date: "2024-01-01",
      maturity_date: "2025-01-01",
      currency: "INR",
      notes: "7% interest rate",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "sandbox-asset-2",
      user_id: "sandbox",
      name: "Mutual Fund - Growth",
      type: "mutual_fund",
      current_value: 250000,
      purchase_value: 200000,
      purchase_date: "2023-06-01",
      maturity_date: null,
      currency: "INR",
      notes: "Equity mutual fund",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "sandbox-asset-3",
      user_id: "sandbox",
      name: "Gold Investment",
      type: "gold",
      current_value: 150000,
      purchase_value: 120000,
      purchase_date: "2023-01-01",
      maturity_date: null,
      currency: "INR",
      notes: "Physical gold",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export function calculateSandboxKPIs() {
  const transactions = generateSandboxTransactions();

  const totalIncome = roundToTwoDecimals(
    transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const totalExpenses = roundToTwoDecimals(
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const netSavings = roundToTwoDecimals(totalIncome - totalExpenses);

  const assets = generateSandboxAssets();
  const totalAssets = roundToTwoDecimals(
    assets.reduce((sum, a) => sum + a.current_value, 0)
  );

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    totalAssets,
    savingsRate: totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0,
  };
}
