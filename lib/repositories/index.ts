import { SupabaseClient } from "@supabase/supabase-js";
import { AssetRepository } from "./asset-repository";
import { LedgerRepository } from "./ledger-repository";
import { TransactionRepository } from "./transaction-repository";
import { UserRepository } from "./user-repository";

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private supabase: SupabaseClient;

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  static getInstance(supabase: SupabaseClient): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(supabase);
    }
    return RepositoryFactory.instance;
  }

  getLedgerRepository(): LedgerRepository {
    return new LedgerRepository(this.supabase);
  }

  getAssetRepository(): AssetRepository {
    return new AssetRepository(this.supabase);
  }

  getTransactionRepository(): TransactionRepository {
    return new TransactionRepository(this.supabase);
  }

  getUserRepository(): UserRepository {
    return new UserRepository(this.supabase);
  }
}

// Convenience function to create repositories
export function createRepositories(supabase: SupabaseClient) {
  const factory = RepositoryFactory.getInstance(supabase);

  return {
    ledgers: factory.getLedgerRepository(),
    assets: factory.getAssetRepository(),
    transactions: factory.getTransactionRepository(),
    users: factory.getUserRepository(),
  };
}

// Export all repository types and interfaces
export * from "./asset-repository";
export * from "./base-repository";
export * from "./ledger-repository";
export * from "./transaction-repository";
export * from "./user-repository";

// Re-export error classes for convenience
export {
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "../errors";
