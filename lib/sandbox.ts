import type { Asset, Ledger, Transaction } from "@/lib/types";
import { formatDateForDatabase, roundToTwoDecimals } from "@/lib/utils";

// Enhanced sandbox mode: Generate comprehensive dummy data for testing all features

// More diverse ledger types
export function generateSandboxLedgers(): Ledger[] {
  const ledgerTypes = [
    { name: "Family Budget", type: "family" as const },
    { name: "Personal Expenses", type: "personal" as const },
    { name: "Emergency Fund", type: "personal" as const },
    { name: "Investment Portfolio", type: "personal" as const },
    { name: "Travel Fund", type: "personal" as const },
    { name: "Loan Account", type: "loan" as const },
  ];

  return ledgerTypes.map((ledger, index) => ({
    id: `sandbox-ledger-${index + 1}`,
    user_id: "sandbox",
    name: ledger.name,
    type: ledger.type,
    currency: "INR",
    created_at: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    ).toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// Much more comprehensive transaction data
export function generateSandboxTransactions(): Transaction[] {
  const today = new Date();
  const transactions: Transaction[] = [];

  // Income sources
  const incomeSources = [
    {
      description: "Monthly Salary",
      category: "Salary",
      amount: [80000, 120000],
    },
    {
      description: "Freelance Project",
      category: "Freelance",
      amount: [15000, 50000],
    },
    {
      description: "Investment Returns",
      category: "Investment",
      amount: [5000, 25000],
    },
    {
      description: "Rental Income",
      category: "Rental",
      amount: [20000, 40000],
    },
    {
      description: "Bonus Payment",
      category: "Salary",
      amount: [30000, 100000],
    },
    {
      description: "Side Business",
      category: "Business",
      amount: [10000, 30000],
    },
    {
      description: "Cashback Rewards",
      category: "Rewards",
      amount: [500, 2000],
    },
    { description: "Refund", category: "Refund", amount: [1000, 5000] },
  ];

  // Expense categories with realistic amounts
  const expenseCategories = [
    { description: "Groceries", category: "Food", amount: [2000, 8000] },
    { description: "Restaurant", category: "Food", amount: [500, 3000] },
    {
      description: "Electricity Bill",
      category: "Bills",
      amount: [2000, 6000],
    },
    { description: "Water Bill", category: "Bills", amount: [500, 1500] },
    { description: "Internet Bill", category: "Bills", amount: [800, 2000] },
    { description: "Mobile Recharge", category: "Bills", amount: [200, 1000] },
    { description: "Petrol", category: "Transport", amount: [1000, 3000] },
    { description: "Uber/Ola", category: "Transport", amount: [200, 1500] },
    {
      description: "Movie Tickets",
      category: "Entertainment",
      amount: [500, 2000],
    },
    {
      description: "Netflix Subscription",
      category: "Entertainment",
      amount: [200, 800],
    },
    { description: "Gym Membership", category: "Health", amount: [2000, 5000] },
    { description: "Doctor Visit", category: "Health", amount: [1000, 5000] },
    { description: "Medicine", category: "Health", amount: [300, 2000] },
    { description: "Shopping", category: "Shopping", amount: [2000, 10000] },
    {
      description: "Online Shopping",
      category: "Shopping",
      amount: [1000, 5000],
    },
    {
      description: "Insurance Premium",
      category: "Insurance",
      amount: [3000, 15000],
    },
    { description: "EMI Payment", category: "Loans", amount: [5000, 25000] },
    {
      description: "Credit Card Payment",
      category: "Loans",
      amount: [2000, 15000],
    },
    {
      description: "Education Fees",
      category: "Education",
      amount: [5000, 20000],
    },
    { description: "Books", category: "Education", amount: [500, 3000] },
    { description: "Travel", category: "Travel", amount: [5000, 50000] },
    { description: "Hotel Booking", category: "Travel", amount: [2000, 15000] },
    {
      description: "Flight Tickets",
      category: "Travel",
      amount: [5000, 30000],
    },
    {
      description: "Charity Donation",
      category: "Charity",
      amount: [1000, 10000],
    },
    { description: "Gift Purchase", category: "Gifts", amount: [500, 5000] },
  ];

  // Generate 6 months of data (180 days)
  for (let i = 0; i < 180; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends for some transactions (more realistic)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // Income transactions (less frequent)
    if (Math.random() > 0.9) {
      const income =
        incomeSources[Math.floor(Math.random() * incomeSources.length)];
      transactions.push({
        id: `sandbox-income-${i}`,
        user_id: "sandbox",
        ledger_id: `sandbox-ledger-${Math.floor(Math.random() * 3) + 1}`, // Use first 3 ledgers
        date: formatDateForDatabase(date),
        description: income.description,
        category: income.category,
        amount:
          Math.floor(Math.random() * (income.amount[1] - income.amount[0])) +
          income.amount[0],
        type: "income",
        notes: Math.random() > 0.7 ? "Monthly payment" : null,
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
      });
    }

    // Expense transactions (more frequent)
    const numExpenses = isWeekend
      ? Math.floor(Math.random() * 2) + 1
      : Math.floor(Math.random() * 3) + 2;
    for (let j = 0; j < numExpenses; j++) {
      const expense =
        expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      transactions.push({
        id: `sandbox-expense-${i}-${j}`,
        user_id: "sandbox",
        ledger_id: `sandbox-ledger-${Math.floor(Math.random() * 6) + 1}`, // Use all ledgers
        date: formatDateForDatabase(date),
        description: expense.description,
        category: expense.category,
        amount:
          Math.floor(Math.random() * (expense.amount[1] - expense.amount[0])) +
          expense.amount[0],
        type: "expense",
        notes:
          Math.random() > 0.8
            ? [
                "Paid via UPI",
                "Credit card payment",
                "Cash payment",
                "Online transfer",
              ][Math.floor(Math.random() * 4)]
            : null,
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
      });
    }
  }

  return transactions;
}

// More diverse and realistic asset portfolio
export function generateSandboxAssets(): Asset[] {
  const assets = [
    // Fixed Deposits
    {
      name: "FD - SBI Bank",
      type: "fd" as const,
      current_value: 500000,
      purchase_value: 500000,
      purchase_date: "2024-01-15",
      maturity_date: "2025-01-15",
      currency: "INR",
      notes: "7.5% interest rate",
    },
    {
      name: "FD - HDFC Bank",
      type: "fd" as const,
      current_value: 300000,
      purchase_value: 300000,
      purchase_date: "2023-08-20",
      maturity_date: "2024-08-20",
      currency: "INR",
      notes: "7.2% interest rate",
    },
    {
      name: "FD - ICICI Bank",
      type: "fd" as const,
      current_value: 750000,
      purchase_value: 750000,
      purchase_date: "2024-03-10",
      maturity_date: "2025-03-10",
      currency: "INR",
      notes: "7.8% interest rate",
    },

    // Mutual Funds
    {
      name: "HDFC Equity Fund",
      type: "mutual_fund" as const,
      current_value: 180000,
      purchase_value: 150000,
      purchase_date: "2023-06-01",
      maturity_date: null,
      currency: "INR",
      notes: "Large cap equity fund",
    },
    {
      name: "SBI Bluechip Fund",
      type: "mutual_fund" as const,
      current_value: 220000,
      purchase_value: 200000,
      purchase_date: "2023-04-15",
      maturity_date: null,
      currency: "INR",
      notes: "Blue chip equity fund",
    },
    {
      name: "Axis Midcap Fund",
      type: "mutual_fund" as const,
      current_value: 95000,
      purchase_value: 100000,
      purchase_date: "2023-09-20",
      maturity_date: null,
      currency: "INR",
      notes: "Mid cap equity fund",
    },
    {
      name: "ICICI Prudential Debt Fund",
      type: "mutual_fund" as const,
      current_value: 120000,
      purchase_value: 120000,
      purchase_date: "2023-12-01",
      maturity_date: null,
      currency: "INR",
      notes: "Debt fund for stability",
    },

    // Stocks
    {
      name: "Reliance Industries",
      type: "stock" as const,
      current_value: 45000,
      purchase_value: 40000,
      purchase_date: "2023-07-10",
      maturity_date: null,
      currency: "INR",
      notes: "50 shares @ ₹800",
    },
    {
      name: "TCS",
      type: "stock" as const,
      current_value: 32000,
      purchase_value: 35000,
      purchase_date: "2023-11-15",
      maturity_date: null,
      currency: "INR",
      notes: "25 shares @ ₹1400",
    },
    {
      name: "Infosys",
      type: "stock" as const,
      current_value: 28000,
      purchase_value: 30000,
      purchase_date: "2023-10-05",
      maturity_date: null,
      currency: "INR",
      notes: "30 shares @ ₹1000",
    },

    // Gold
    {
      name: "Gold ETF",
      type: "gold" as const,
      current_value: 85000,
      purchase_value: 80000,
      purchase_date: "2023-05-20",
      maturity_date: null,
      currency: "INR",
      notes: "Gold ETF units",
    },
    {
      name: "Physical Gold",
      type: "gold" as const,
      current_value: 120000,
      purchase_value: 110000,
      purchase_date: "2023-02-14",
      maturity_date: null,
      currency: "INR",
      notes: "Gold jewelry",
    },

    // Real Estate
    {
      name: "Apartment Investment",
      type: "real_estate" as const,
      current_value: 2500000,
      purchase_value: 2200000,
      purchase_date: "2022-08-15",
      maturity_date: null,
      currency: "INR",
      notes: "2BHK apartment for rental",
    },

    // Other Investments
    {
      name: "PPF Account",
      type: "other" as const,
      current_value: 150000,
      purchase_value: 150000,
      purchase_date: "2023-04-01",
      maturity_date: "2033-04-01",
      currency: "INR",
      notes: "Public Provident Fund",
    },
    {
      name: "NPS Account",
      type: "other" as const,
      current_value: 80000,
      purchase_value: 75000,
      purchase_date: "2023-06-01",
      maturity_date: null,
      currency: "INR",
      notes: "National Pension System",
    },
  ];

  return assets.map((asset, index) => ({
    id: `sandbox-asset-${index + 1}`,
    user_id: "sandbox",
    ...asset,
    created_at: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    ).toISOString(),
    updated_at: new Date().toISOString(),
  }));
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
