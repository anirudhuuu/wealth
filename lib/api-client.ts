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
  TransactionSummary,
  UpdateAssetInput,
  UpdateLedgerInput,
  UpdateProfileInput,
  UpdateTransactionInput,
} from "@/lib/types";

class ApiClient {
  private repositories: ReturnType<typeof createRepositories>;
  private supabase = createClient();

  constructor() {
    this.repositories = createRepositories(this.supabase);
  }

  private async getCurrentUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    return user.id;
  }

  // Ledger methods
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

  // Asset methods
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

  // Transaction methods
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

  async getTransactionSummary(
    filters?: TransactionFilters
  ): Promise<TransactionSummary> {
    const userId = await this.getCurrentUserId();
    return this.repositories.transactions.getSummary(userId, filters);
  }

  // User methods
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
