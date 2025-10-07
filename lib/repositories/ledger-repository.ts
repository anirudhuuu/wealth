import { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../errors";
import {
  CreateLedgerInput,
  Ledger,
  LedgerFilters,
  UpdateLedgerInput,
} from "../types";
import { BaseRepository } from "./base-repository";

export class LedgerRepository extends BaseRepository<Ledger> {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  protected getTableName(): string {
    return "ledgers";
  }

  async getByUserId(userId: string): Promise<Ledger[]> {
    await this.validateUser(userId);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("ledgers")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      "fetch ledgers by user"
    );
  }

  async getById(id: string, userId: string): Promise<Ledger> {
    await this.validateId(id);
    await this.validateUser(userId);

    return this.executeQuery(
      async () =>
        await this.supabase
          .from("ledgers")
          .select("*")
          .eq("id", id)
          .eq("user_id", userId)
          .single(),
      "fetch ledger by id"
    );
  }

  async create(input: CreateLedgerInput, userId: string): Promise<Ledger> {
    await this.validateUser(userId);

    if (!input.name?.trim()) {
      throw new ValidationError("Ledger name is required");
    }

    if (!input.type) {
      throw new ValidationError("Ledger type is required");
    }

    const ledgerData = {
      user_id: userId,
      name: input.name.trim(),
      type: input.type,
      currency: input.currency || "INR",
    };

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("ledgers")
          .insert(ledgerData)
          .select()
          .single(),
      "create ledger"
    );
  }

  async update(
    id: string,
    input: UpdateLedgerInput,
    userId: string
  ): Promise<Ledger> {
    await this.validateId(id);
    await this.validateUser(userId);

    if (input.name !== undefined && !input.name?.trim()) {
      throw new ValidationError("Ledger name cannot be empty");
    }

    const updateData: Partial<Ledger> = {};

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.currency !== undefined) {
      updateData.currency = input.currency;
    }

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("ledgers")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single(),
      "update ledger"
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.validateId(id);
    await this.validateUser(userId);

    const { error } = await this.supabase
      .from("ledgers")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "delete ledger");
    }
  }

  async getWithFilters(
    userId: string,
    filters: LedgerFilters = {}
  ): Promise<Ledger[]> {
    await this.validateUser(userId);

    let query = this.supabase.from("ledgers").select("*").eq("user_id", userId);

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.currency) {
      query = query.eq("currency", filters.currency);
    }

    return this.executeQueryList(
      async () => await query.order("created_at", { ascending: false }),
      "fetch ledgers with filters"
    );
  }

  async getTransactionCount(id: string, userId: string): Promise<number> {
    await this.validateId(id);
    await this.validateUser(userId);

    const { count, error } = await this.supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("ledger_id", id)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "count transactions");
    }

    return count || 0;
  }

  async getTotalAmount(
    id: string,
    userId: string,
    type?: "income" | "expense"
  ): Promise<number> {
    await this.validateId(id);
    await this.validateUser(userId);

    let query = this.supabase
      .from("transactions")
      .select("amount")
      .eq("ledger_id", id)
      .eq("user_id", userId);

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      await this.handleError(error, "calculate total amount");
    }

    return (data || []).reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );
  }
}
