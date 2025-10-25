import { createRepositories } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/client";
import type {
  Asset,
  AssetFilters,
  CreateAssetInput,
  CreateLedgerInput,
  CreateTransactionInput,
  Ledger,
  LedgerFilters,
  Profile,
  Transaction,
  TransactionFilters,
  UpdateAssetInput,
  UpdateLedgerInput,
  UpdateProfileInput,
  UpdateTransactionInput,
} from "@/lib/types";

export class ApiClient {
  private repositories = createRepositories(createClient());

  private async getCurrentUserId(): Promise<string> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    return user.id;
  }

  // ========================================
  // LEDGER OPERATIONS
  // ========================================
  async getLedgers(filters?: LedgerFilters): Promise<Ledger[]> {
    const userId = await this.getCurrentUserId();
    return this.repositories.ledgers.getWithFilters(userId, filters);
  }

  async getLedger(id: string): Promise<Ledger> {
    const userId = await this.getCurrentUserId();
    return this.repositories.ledgers.getById(id, userId);
  }

  async createLedger(input: CreateLedgerInput): Promise<Ledger> {
    const userId = await this.getCurrentUserId();
    return this.repositories.ledgers.create(input, userId);
  }

  async updateLedger(id: string, input: UpdateLedgerInput): Promise<Ledger> {
    const userId = await this.getCurrentUserId();
    return this.repositories.ledgers.update(id, input, userId);
  }

  async deleteLedger(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    return this.repositories.ledgers.delete(id, userId);
  }

  // ========================================
  // ASSET OPERATIONS
  // ========================================
  async getAssets(filters?: AssetFilters): Promise<Asset[]> {
    const userId = await this.getCurrentUserId();
    return this.repositories.assets.getWithFilters(userId, filters);
  }

  async getAsset(id: string): Promise<Asset> {
    const userId = await this.getCurrentUserId();
    return this.repositories.assets.getById(id, userId);
  }

  async createAsset(input: CreateAssetInput): Promise<Asset> {
    const userId = await this.getCurrentUserId();
    return this.repositories.assets.create(input, userId);
  }

  async updateAsset(id: string, input: UpdateAssetInput): Promise<Asset> {
    const userId = await this.getCurrentUserId();
    return this.repositories.assets.update(id, input, userId);
  }

  async deleteAsset(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    return this.repositories.assets.delete(id, userId);
  }

  // ========================================
  // TRANSACTION OPERATIONS
  // ========================================
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    const userId = await this.getCurrentUserId();
    return this.repositories.transactions.getWithFilters(userId, filters);
  }

  async getTransaction(id: string): Promise<Transaction> {
    const userId = await this.getCurrentUserId();
    return this.repositories.transactions.getById(id, userId);
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const userId = await this.getCurrentUserId();
    return this.repositories.transactions.create(input, userId);
  }

  async updateTransaction(
    id: string,
    input: UpdateTransactionInput
  ): Promise<Transaction> {
    const userId = await this.getCurrentUserId();
    return this.repositories.transactions.update(id, input, userId);
  }

  async deleteTransaction(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    return this.repositories.transactions.delete(id, userId);
  }

  async getTransactionSummary(filters?: TransactionFilters): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    transactionCount: number;
  }> {
    const userId = await this.getCurrentUserId();
    return this.repositories.transactions.getSummary(userId, filters);
  }

  // ========================================
  // DASHBOARD OPERATIONS
  // ========================================
  async getDashboardKPIs(
    timeRange: string = "12m",
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    kpis: {
      totalIncome: number;
      totalExpenses: number;
      netSavings: number;
      totalAssets: number;
      savingsRate: number;
    };
    transactions: Transaction[];
    categoryData: Record<string, number>;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
    timeRange: string;
  }> {
    const userId = await this.getCurrentUserId();

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "3m":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate()
        );
        break;
      case "6m":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate()
        );
        break;
      case "12m":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 12,
          now.getDate()
        );
        break;
      default:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 12,
          now.getDate()
        );
    }

    // Get transactions and assets
    const transactions = await this.repositories.transactions.getWithFilters(
      userId,
      {
        startDate,
        endDate: now,
      }
    );
    const assets = await this.repositories.assets.getWithFilters(userId);

    // Calculate KPIs
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netSavings = totalIncome - totalExpenses;
    const totalAssets = assets.reduce(
      (sum, a) => sum + Number(a.current_value),
      0
    );
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Calculate category data
    const categoryData: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type === "expense") {
        categoryData[t.category] =
          (categoryData[t.category] || 0) + Number(t.amount);
      }
    });

    // Apply pagination
    const paginatedTransactions = transactions.slice(offset, offset + limit);
    const totalTransactions = transactions.length;

    return {
      kpis: {
        totalIncome,
        totalExpenses,
        netSavings,
        totalAssets,
        savingsRate,
      },
      transactions: paginatedTransactions,
      categoryData,
      pagination: {
        total: totalTransactions,
        limit,
        offset,
        hasMore: totalTransactions > offset + limit,
      },
      timeRange,
    };
  }

  // ========================================
  // USER OPERATIONS
  // ========================================
  async getProfile(): Promise<Profile> {
    const userId = await this.getCurrentUserId();
    return this.repositories.users.getProfile(userId);
  }

  async updateProfile(input: UpdateProfileInput): Promise<Profile> {
    const userId = await this.getCurrentUserId();
    return this.repositories.users.updateProfile(input, userId);
  }
}

export const apiClient = new ApiClient();
