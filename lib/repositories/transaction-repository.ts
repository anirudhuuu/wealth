import { formatDateForDatabase } from "@/lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../errors";
import {
  CreateTransactionInput,
  Transaction,
  TransactionFilters,
  TransactionSummary,
  UpdateTransactionInput,
} from "../types";
import { BaseRepository } from "./base-repository";

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  protected getTableName(): string {
    return "transactions";
  }

  async getByUserId(userId: string): Promise<Transaction[]> {
    await this.validateUser(userId);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false }),
      "fetch transactions by user"
    );
  }

  async getById(id: string, userId: string): Promise<Transaction> {
    await this.validateId(id);
    await this.validateUser(userId);

    return this.executeQuery(
      async () =>
        await this.supabase
          .from("transactions")
          .select("*")
          .eq("id", id)
          .eq("user_id", userId)
          .single(),
      "fetch transaction by id"
    );
  }

  async getByLedgerId(
    ledgerId: string,
    userId: string
  ): Promise<Transaction[]> {
    await this.validateId(ledgerId);
    await this.validateUser(userId);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("transactions")
          .select("*")
          .eq("ledger_id", ledgerId)
          .eq("user_id", userId)
          .order("date", { ascending: false }),
      "fetch transactions by ledger"
    );
  }

  async create(
    input: CreateTransactionInput,
    userId: string
  ): Promise<Transaction> {
    await this.validateUser(userId);

    if (!input.ledgerId) {
      throw new ValidationError("Ledger ID is required");
    }

    if (!input.description?.trim()) {
      throw new ValidationError("Transaction description is required");
    }

    if (!input.category?.trim()) {
      throw new ValidationError("Transaction category is required");
    }

    if (!input.type) {
      throw new ValidationError("Transaction type is required");
    }

    if (input.amount <= 0) {
      throw new ValidationError("Transaction amount must be greater than 0");
    }

    const transactionData = {
      user_id: userId,
      ledger_id: input.ledgerId,
      date: formatDateForDatabase(input.date),
      description: input.description.trim(),
      category: input.category.trim(),
      amount: input.amount,
      type: input.type,
      notes: input.notes,
    };

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("transactions")
          .insert(transactionData)
          .select()
          .single(),
      "create transaction"
    );
  }

  async update(
    id: string,
    input: UpdateTransactionInput,
    userId: string
  ): Promise<Transaction> {
    await this.validateId(id);
    await this.validateUser(userId);

    if (input.description !== undefined && !input.description?.trim()) {
      throw new ValidationError("Transaction description cannot be empty");
    }

    if (input.category !== undefined && !input.category?.trim()) {
      throw new ValidationError("Transaction category cannot be empty");
    }

    if (input.amount !== undefined && input.amount <= 0) {
      throw new ValidationError("Transaction amount must be greater than 0");
    }

    const updateData: Partial<Transaction> = {};

    if (input.ledgerId !== undefined) {
      updateData.ledger_id = input.ledgerId;
    }
    if (input.date !== undefined) {
      updateData.date = formatDateForDatabase(input.date);
    }
    if (input.description !== undefined) {
      updateData.description = input.description.trim();
    }
    if (input.category !== undefined) {
      updateData.category = input.category.trim();
    }
    if (input.amount !== undefined) {
      updateData.amount = input.amount;
    }
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("transactions")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single(),
      "update transaction"
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.validateId(id);
    await this.validateUser(userId);

    const { error } = await this.supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "delete transaction");
    }
  }

  async getWithFilters(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<Transaction[]> {
    await this.validateUser(userId);

    let query = this.supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId);

    if (filters.ledgerId) {
      query = query.eq("ledger_id", filters.ledgerId);
    }

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.startDate) {
      query = query.gte("date", formatDateForDatabase(filters.startDate));
    }

    if (filters.endDate) {
      query = query.lte("date", formatDateForDatabase(filters.endDate));
    }

    if (filters.minAmount !== undefined) {
      query = query.gte("amount", filters.minAmount);
    }

    if (filters.maxAmount !== undefined) {
      query = query.lte("amount", filters.maxAmount);
    }

    return this.executeQueryList(
      async () => await query.order("date", { ascending: false }),
      "fetch transactions with filters"
    );
  }

  async getSummary(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<TransactionSummary> {
    await this.validateUser(userId);

    const transactions = await this.getWithFilters(userId, filters);

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      transactionCount: transactions.length,
    };
  }

  async getCategoryBreakdown(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<Record<string, number>> {
    await this.validateUser(userId);

    const transactions = await this.getWithFilters(userId, filters);

    const categoryBreakdown: Record<string, number> = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryBreakdown[t.category] =
          (categoryBreakdown[t.category] || 0) + Number(t.amount);
      });

    return categoryBreakdown;
  }

  async getMonthlyTrends(
    userId: string,
    months: number = 12
  ): Promise<Record<string, TransactionSummary>> {
    await this.validateUser(userId);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await this.getWithFilters(userId, {
      startDate,
      endDate,
    });

    const monthlyTrends: Record<string, TransactionSummary> = {};

    transactions.forEach((transaction) => {
      const monthKey = transaction.date.substring(0, 7); // YYYY-MM format

      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = {
          totalIncome: 0,
          totalExpenses: 0,
          netAmount: 0,
          transactionCount: 0,
        };
      }

      const summary = monthlyTrends[monthKey];
      summary.transactionCount++;

      if (transaction.type === "income") {
        summary.totalIncome += Number(transaction.amount);
      } else {
        summary.totalExpenses += Number(transaction.amount);
      }

      summary.netAmount = summary.totalIncome - summary.totalExpenses;
    });

    return monthlyTrends;
  }

  async getRecentTransactions(
    userId: string,
    limit: number = 10
  ): Promise<Transaction[]> {
    await this.validateUser(userId);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(limit),
      "fetch recent transactions"
    );
  }
}
