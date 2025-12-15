import { formatDateForDatabase, parseDateFromDatabase } from "@/lib/utils";
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
          .select(
            `
            *,
            recurring_transactions!template_id (
              frequency,
              end_date
            )
          `
          )
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
          .select(
            `
            *,
            recurring_transactions!template_id (
              frequency,
              end_date
            )
          `
          )
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
          .select(
            `
            *,
            recurring_transactions!template_id (
              frequency,
              end_date
            )
          `
          )
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

    const transactionData: Omit<
      Transaction,
      "id" | "created_at" | "updated_at" | "recurring_transactions"
    > = {
      user_id: userId,
      ledger_id: input.ledgerId,
      date: formatDateForDatabase(input.date),
      description: input.description.trim(),
      category: input.category.trim(),
      amount: input.amount,
      type: input.type,
      notes: input.notes || null,
      template_id: null,
    };

    // If this is a recurring transaction, create a recurring template
    if (input.isRecurring && input.recurringFrequency) {
      const recurringData = {
        user_id: userId,
        ledger_id: input.ledgerId,
        description: input.description.trim(),
        category: input.category.trim(),
        amount: input.amount,
        type: input.type,
        notes: input.notes,
        frequency: input.recurringFrequency,
        interval_count: 1,
        start_date: formatDateForDatabase(input.date),
        end_date: input.recurringEndDate
          ? formatDateForDatabase(input.recurringEndDate)
          : null,
        next_due_date: formatDateForDatabase(input.date),
        is_active: true,
      };

      // Create recurring transaction first
      const { data: recurringTxn, error: recurringError } = await this.supabase
        .from("recurring_transactions")
        .insert(recurringData)
        .select()
        .single();

      if (recurringError) {
        throw new ValidationError(
          `Failed to create recurring transaction: ${recurringError.message}`
        );
      }

      // Add template_id to the transaction
      transactionData.template_id = recurringTxn.id;
    }

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

    // Get current transaction to check for existing template_id
    const currentTransaction = await this.getById(id, userId);

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

    // Handle recurring transaction logic
    if (input.isRecurring && input.recurringFrequency) {
      // Validate required fields for recurring transaction
      const ledgerId =
        input.ledgerId || updateData.ledger_id || currentTransaction.ledger_id;
      const description =
        input.description?.trim() ||
        updateData.description ||
        currentTransaction.description;
      const category =
        input.category?.trim() ||
        updateData.category ||
        currentTransaction.category;
      const amount =
        input.amount !== undefined
          ? input.amount
          : updateData.amount !== undefined
          ? updateData.amount
          : currentTransaction.amount;
      const type = input.type || updateData.type || currentTransaction.type;
      // Use input date if provided, otherwise use current transaction date
      const date = input.date || parseDateFromDatabase(currentTransaction.date);

      if (!ledgerId) {
        throw new ValidationError(
          "Ledger ID is required for recurring transactions"
        );
      }
      if (!description) {
        throw new ValidationError(
          "Description is required for recurring transactions"
        );
      }
      if (!category) {
        throw new ValidationError(
          "Category is required for recurring transactions"
        );
      }
      if (amount <= 0) {
        throw new ValidationError(
          "Amount must be greater than 0 for recurring transactions"
        );
      }
      if (!type) {
        throw new ValidationError(
          "Type is required for recurring transactions"
        );
      }

      const recurringData = {
        user_id: userId,
        ledger_id: ledgerId,
        description: description,
        category: category,
        amount: amount,
        type: type,
        notes:
          input.notes !== undefined
            ? input.notes
            : updateData.notes !== undefined
            ? updateData.notes
            : currentTransaction.notes,
        frequency: input.recurringFrequency,
        interval_count: 1,
        start_date: formatDateForDatabase(date),
        end_date: input.recurringEndDate
          ? formatDateForDatabase(input.recurringEndDate)
          : null,
        next_due_date: formatDateForDatabase(date),
        is_active: true,
      };

      // If transaction already has a template_id, update the existing template
      if (currentTransaction.template_id) {
        const { error: recurringError } = await this.supabase
          .from("recurring_transactions")
          .update(recurringData)
          .eq("id", currentTransaction.template_id)
          .eq("user_id", userId);

        if (recurringError) {
          throw new ValidationError(
            `Failed to update recurring transaction: ${recurringError.message}`
          );
        }

        // Keep the existing template_id
        updateData.template_id = currentTransaction.template_id;
      } else {
        // Create new recurring transaction template
        const { data: recurringTxn, error: recurringError } =
          await this.supabase
            .from("recurring_transactions")
            .insert(recurringData)
            .select()
            .single();

        if (recurringError) {
          throw new ValidationError(
            `Failed to create recurring transaction: ${recurringError.message}`
          );
        }

        // Add template_id to the transaction
        updateData.template_id = recurringTxn.id;
      }
    } else if (input.isRecurring === false) {
      // User explicitly turned OFF recurring - remove template_id
      // Note: We don't delete the template, just remove the association
      // The template can be cleaned up separately if needed
      updateData.template_id = null;
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
      .select(
        `
        *,
        recurring_transactions!template_id (
          frequency,
          end_date
        )
      `
      )
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
