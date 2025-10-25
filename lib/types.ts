export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ledger {
  id: string;
  user_id: string;
  name: string;
  type: "family" | "personal" | "loan";
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  ledger_id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  notes: string | null;
  template_id?: string | null;
  created_at: string;
  updated_at: string;
  // Recurring data (only present when template_id exists)
  recurring_transactions?: {
    frequency: "weekly" | "monthly" | "yearly";
    end_date: string | null;
  } | null;
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  type:
    | "fd"
    | "mutual_fund"
    | "stock"
    | "gold"
    | "real_estate"
    | "crypto"
    | "other";
  current_value: number;
  purchase_value: number | null;
  purchase_date: string | null;
  maturity_date: string | null;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Repository input types
export interface CreateLedgerInput {
  name: string;
  type: "family" | "personal" | "loan";
  currency?: string;
}

export interface UpdateLedgerInput {
  name?: string;
  type?: "family" | "personal" | "loan";
  currency?: string;
}

export interface CreateAssetInput {
  name: string;
  type:
    | "fd"
    | "mutual_fund"
    | "stock"
    | "gold"
    | "real_estate"
    | "crypto"
    | "other";
  currentValue: number;
  purchaseValue?: number | null;
  purchaseDate?: Date | null;
  maturityDate?: Date | null;
  currency?: string;
  notes?: string | null;
}

export interface UpdateAssetInput {
  name?: string;
  type?:
    | "fd"
    | "mutual_fund"
    | "stock"
    | "gold"
    | "real_estate"
    | "crypto"
    | "other";
  currentValue?: number;
  purchaseValue?: number | null;
  purchaseDate?: Date | null;
  maturityDate?: Date | null;
  currency?: string;
  notes?: string | null;
}

export interface CreateTransactionInput {
  ledgerId: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  notes?: string | null;
  isRecurring?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
  recurringEndDate?: Date | null;
}

export interface UpdateTransactionInput {
  ledgerId?: string;
  date?: Date;
  description?: string;
  category?: string;
  amount?: number;
  type?: "income" | "expense";
  notes?: string | null;
  isRecurring?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
  recurringEndDate?: Date | null;
}

export interface CreateProfileInput {
  email: string;
  displayName?: string | null;
}

export interface UpdateProfileInput {
  displayName?: string | null;
}

// Filter types
export interface LedgerFilters {
  type?: "family" | "personal" | "loan";
  currency?: string;
}

export interface AssetFilters {
  type?:
    | "fd"
    | "mutual_fund"
    | "stock"
    | "gold"
    | "real_estate"
    | "crypto"
    | "other";
  currency?: string;
  minValue?: number;
  maxValue?: number;
}

export interface TransactionFilters {
  ledgerId?: string;
  type?: "income" | "expense";
  category?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

// Summary types
export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
}
