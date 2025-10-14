import { createRepositories } from "@/lib/repositories";
import {
  calculateSandboxKPIs,
  generateSandboxAssets,
  generateSandboxLedgers,
  generateSandboxTransactions,
} from "@/lib/sandbox";
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
  TransactionSummary,
  UpdateAssetInput,
  UpdateLedgerInput,
  UpdateProfileInput,
  UpdateTransactionInput,
} from "@/lib/types";

/**
 * API Client - Centralized data access layer
 * Uses repository pattern for consistent data operations
 * Handles authentication and data transformation
 */
class ApiClient {
  private repositories: ReturnType<typeof createRepositories>;
  private supabase = createClient();

  constructor() {
    this.repositories = createRepositories(this.supabase);
  }

  /**
   * Get current authenticated user ID
   * @throws Error if user is not authenticated
   */
  private async getCurrentUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    return user.id;
  }

  /**
   * Check if current user is admin
   */
  private async isCurrentUserAdmin(): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    return this.repositories.users.isAdmin(userId);
  }

  // ========================================
  // LEDGER OPERATIONS
  // ========================================
  async getLedgers(filters?: LedgerFilters): Promise<Ledger[]> {
    const isAdmin = await this.isCurrentUserAdmin();

    if (!isAdmin) {
      // Return sandbox data for non-admin users
      let sandboxLedgers = generateSandboxLedgers();

      // Apply filters to sandbox data
      if (filters?.type) {
        sandboxLedgers = sandboxLedgers.filter(
          (ledger) => ledger.type === filters.type
        );
      }
      if (filters?.currency) {
        sandboxLedgers = sandboxLedgers.filter(
          (ledger) => ledger.currency === filters.currency
        );
      }

      return sandboxLedgers;
    }

    // Admin users get real data
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
    const isAdmin = await this.isCurrentUserAdmin();

    if (!isAdmin) {
      // Return sandbox data for non-admin users
      let sandboxAssets = generateSandboxAssets();

      // Apply filters to sandbox data
      if (filters?.type) {
        sandboxAssets = sandboxAssets.filter((a) => a.type === filters.type);
      }

      return sandboxAssets;
    }

    // Admin users get real data
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
    const isAdmin = await this.isCurrentUserAdmin();

    if (!isAdmin) {
      // Return sandbox data for non-admin users
      let sandboxTransactions = generateSandboxTransactions();

      // Apply filters to sandbox data
      if (filters?.ledgerId) {
        sandboxTransactions = sandboxTransactions.filter(
          (t) => t.ledger_id === filters.ledgerId
        );
      }
      if (filters?.type) {
        sandboxTransactions = sandboxTransactions.filter(
          (t) => t.type === filters.type
        );
      }
      if (filters?.category) {
        sandboxTransactions = sandboxTransactions.filter(
          (t) => t.category === filters.category
        );
      }
      if (filters?.startDate) {
        sandboxTransactions = sandboxTransactions.filter(
          (t) => new Date(t.date) >= filters.startDate!
        );
      }
      if (filters?.endDate) {
        sandboxTransactions = sandboxTransactions.filter(
          (t) => new Date(t.date) <= filters.endDate!
        );
      }

      return sandboxTransactions;
    }

    // Admin users get real data
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

  async getTransactionSummary(
    filters?: TransactionFilters
  ): Promise<TransactionSummary> {
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
    const isAdmin = await this.isCurrentUserAdmin();

    if (!isAdmin) {
      // Return sandbox data for non-admin users
      const sandboxTransactions = generateSandboxTransactions();
      const sandboxAssets = generateSandboxAssets();
      const sandboxKPIs = calculateSandboxKPIs();

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
          startDate = new Date(0); // All time
      }

      // Filter transactions by date range
      const filteredTransactions = sandboxTransactions.filter(
        (t) => new Date(t.date) >= startDate
      );

      // Apply pagination to transactions
      const paginatedTransactions = filteredTransactions.slice(
        offset,
        offset + limit
      );

      // Calculate category breakdown
      const categoryData: Record<string, number> = {};
      filteredTransactions
        .filter((t) => t.type === "expense")
        .forEach((t) => {
          categoryData[t.category] =
            (categoryData[t.category] || 0) + Number(t.amount);
        });

      return {
        kpis: sandboxKPIs,
        transactions: paginatedTransactions,
        categoryData,
        pagination: {
          total: filteredTransactions.length,
          limit,
          offset,
          hasMore: filteredTransactions.length > offset + limit,
        },
        timeRange,
      };
    }

    // Admin users get real data using repository methods
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
        startDate = new Date(0); // All time
    }

    // Use repository methods for data fetching
    const [transactions, assets] = await Promise.all([
      this.repositories.transactions.getWithFilters(userId, {
        startDate: startDate,
      }),
      this.repositories.assets.getWithFilters(userId),
    ]);

    // Apply pagination to transactions
    const paginatedTransactions = transactions.slice(offset, offset + limit);

    // Calculate KPIs using repository data
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    const totalAssets = assets.reduce(
      (sum, a) => sum + Number(a.current_value),
      0
    );

    // Calculate category breakdown
    const categoryData: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryData[t.category] =
          (categoryData[t.category] || 0) + Number(t.amount);
      });

    // Get total count for pagination (simplified - in real app would need separate query)
    const totalTransactions = transactions.length + offset; // Approximation

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

// Create a singleton instance
export const apiClient = new ApiClient();
