import { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError, NotFoundError, ValidationError } from "../errors";

// Define a proper error type for Supabase errors
interface SupabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

export abstract class BaseRepository<T> {
  constructor(protected supabase: SupabaseClient) {}

  protected async handleError(
    error: SupabaseError,
    operation: string
  ): Promise<never> {
    if (error.code === "PGRST116") {
      throw new NotFoundError(this.getTableName());
    }

    throw new DatabaseError(`Failed to ${operation}: ${error.message}`);
  }

  protected async validateUser(userId: string): Promise<void> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }
  }

  protected async validateId(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError("ID is required");
    }
  }

  protected abstract getTableName(): string;

  protected async executeQuery<R>(
    queryFn: () => Promise<{ data: R | null; error: SupabaseError | null }>,
    operation: string
  ): Promise<R> {
    const { data, error } = await queryFn();

    if (error) {
      await this.handleError(error, operation);
    }

    if (data === null) {
      throw new NotFoundError(this.getTableName(), "unknown");
    }

    return data;
  }

  protected async executeQueryList<R>(
    queryFn: () => Promise<{ data: R[] | null; error: SupabaseError | null }>,
    operation: string
  ): Promise<R[]> {
    const { data, error } = await queryFn();

    if (error) {
      await this.handleError(error, operation);
    }

    return data || [];
  }

  protected async executeMutation<R>(
    mutationFn: () => Promise<{ data: R | null; error: SupabaseError | null }>,
    operation: string
  ): Promise<R> {
    const { data, error } = await mutationFn();

    if (error) {
      await this.handleError(error, operation);
    }

    if (data === null) {
      throw new NotFoundError(this.getTableName(), "unknown");
    }

    return data;
  }

  protected async executeMutationList<R>(
    mutationFn: () => Promise<{
      data: R[] | null;
      error: SupabaseError | null;
    }>,
    operation: string
  ): Promise<R[]> {
    const { data, error } = await mutationFn();

    if (error) {
      await this.handleError(error, operation);
    }

    return data || [];
  }
}
