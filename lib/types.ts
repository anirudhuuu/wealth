export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
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
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  type: "fd" | "mutual_fund" | "gold" | "real_estate" | "other";
  current_value: number;
  purchase_value: number | null;
  purchase_date: string | null;
  maturity_date: string | null;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FxRate {
  id: string;
  user_id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  base_currency: string;
  theme: "light" | "dark" | "system";
  created_at: string;
  updated_at: string;
}
