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

export interface GoalMilestone {
  amount: number;
  label: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  target_date: string | null;
  description: string | null;
  status: "active" | "completed" | "paused";
  milestones: GoalMilestone[] | null;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  date: string;
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

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  currency?: string;
  targetDate?: Date | null;
  description?: string | null;
  milestones?: GoalMilestone[] | null;
}

export interface UpdateGoalInput {
  name?: string;
  targetAmount?: number;
  currency?: string;
  targetDate?: Date | null;
  description?: string | null;
  status?: "active" | "completed" | "paused";
  milestones?: GoalMilestone[] | null;
}

export interface CreateGoalContributionInput {
  goalId: string;
  amount: number;
  date: Date;
  notes?: string | null;
}

export interface UpdateGoalContributionInput {
  amount?: number;
  date?: Date;
  notes?: string | null;
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

export interface GoalFilters {
  status?: "active" | "completed" | "paused";
  currency?: string;
  minTargetAmount?: number;
  maxTargetAmount?: number;
}

// Summary types
export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
}

export interface GoalProgress {
  percentage: number;
  amountRemaining: number;
  daysRemaining: number | null;
  estimatedCompletionDate: Date | null;
  isCompleted: boolean;
  isOverdue: boolean;
}

export interface Debt {
  id: string;
  user_id: string;
  ledger_id: string | null;
  name: string;
  creditor_name: string | null;
  principal_amount: number;
  current_balance: number;
  interest_rate: number;
  interest_type: "simple" | "compound" | "fixed" | "variable";
  compounding_frequency: "daily" | "monthly" | "yearly" | null;
  currency: string;
  start_date: string;
  maturity_date: string | null;
  minimum_payment: number | null;
  payment_frequency: "weekly" | "biweekly" | "monthly" | "yearly";
  next_payment_date: string | null;
  payoff_strategy: "snowball" | "avalanche" | "custom" | "minimum_only";
  status: "active" | "paid_off" | "defaulted" | "paused";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  user_id: string;
  transaction_id: string | null;
  amount: number;
  principal_paid: number;
  interest_paid: number;
  payment_date: string;
  is_scheduled: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtSchedule {
  id: string;
  debt_id: string;
  user_id: string;
  scheduled_date: string;
  scheduled_amount: number;
  status: "pending" | "paid" | "missed" | "skipped";
  payment_id: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDebtInput {
  ledgerId?: string | null;
  name: string;
  creditorName?: string | null;
  principalAmount: number;
  interestRate: number;
  interestType: "simple" | "compound" | "fixed" | "variable";
  compoundingFrequency?: "daily" | "monthly" | "yearly" | null;
  currency?: string;
  startDate: Date;
  maturityDate?: Date | null;
  minimumPayment?: number | null;
  paymentFrequency: "weekly" | "biweekly" | "monthly" | "yearly";
  nextPaymentDate?: Date | null;
  payoffStrategy?: "snowball" | "avalanche" | "custom" | "minimum_only";
  notes?: string | null;
}

export interface UpdateDebtInput {
  ledgerId?: string | null;
  name?: string;
  creditorName?: string | null;
  principalAmount?: number;
  interestRate?: number;
  interestType?: "simple" | "compound" | "fixed" | "variable";
  compoundingFrequency?: "daily" | "monthly" | "yearly" | null;
  currency?: string;
  startDate?: Date;
  maturityDate?: Date | null;
  minimumPayment?: number | null;
  paymentFrequency?: "weekly" | "biweekly" | "monthly" | "yearly";
  nextPaymentDate?: Date | null;
  payoffStrategy?: "snowball" | "avalanche" | "custom" | "minimum_only";
  status?: "active" | "paid_off" | "defaulted" | "paused";
  notes?: string | null;
}

export interface CreateDebtPaymentInput {
  debtId: string;
  transactionId?: string | null;
  amount: number;
  principalPaid: number;
  interestPaid: number;
  paymentDate: Date;
  isScheduled?: boolean;
  notes?: string | null;
}

export interface UpdateDebtPaymentInput {
  amount?: number;
  principalPaid?: number;
  interestPaid?: number;
  paymentDate?: Date;
  isScheduled?: boolean;
  notes?: string | null;
}

export interface DebtFilters {
  status?: "active" | "paid_off" | "defaulted" | "paused";
  currency?: string;
  payoffStrategy?: "snowball" | "avalanche" | "custom" | "minimum_only";
  ledgerId?: string;
}

export interface DebtProgress {
  percentagePaid: number;
  amountRemaining: number;
  totalPaid: number;
  totalInterestPaid: number;
  projectedPayoffDate: Date | null;
  daysRemaining: number | null;
  isPaidOff: boolean;
  interestSaved: number;
}

export interface PayoffStrategy {
  strategy: "snowball" | "avalanche";
  totalMonths: number;
  totalInterest: number;
  totalPayments: number;
  payoffOrder: Array<{
    debtId: string;
    debtName: string;
    payoffMonth: number;
    totalPaid: number;
    interestPaid: number;
  }>;
}

export interface InterestCalculation {
  principal: number;
  rate: number;
  timeInYears: number;
  interestAmount: number;
  totalAmount: number;
  breakdown: Array<{
    period: number;
    principal: number;
    interest: number;
    total: number;
  }>;
}
