import { formatDateForDatabase } from "@/lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../errors";
import {
  CreateDebtPaymentInput,
  DebtPayment,
  UpdateDebtPaymentInput,
} from "../types";
import { BaseRepository } from "./base-repository";

export class DebtPaymentRepository extends BaseRepository<DebtPayment> {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  protected getTableName(): string {
    return "debt_payments";
  }

  async getByDebtId(debtId: string, userId: string): Promise<DebtPayment[]> {
    await this.validateId(debtId);
    await this.validateUser(userId);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("debt_payments")
          .select("*")
          .eq("debt_id", debtId)
          .eq("user_id", userId)
          .order("payment_date", { ascending: false }),
      "fetch payments by debt"
    );
  }

  async getById(
    id: string,
    debtId: string,
    userId: string
  ): Promise<DebtPayment> {
    await this.validateId(id);
    await this.validateUser(userId);

    return this.executeQuery(
      async () =>
        await this.supabase
          .from("debt_payments")
          .select("*")
          .eq("id", id)
          .eq("debt_id", debtId)
          .eq("user_id", userId)
          .single(),
      "fetch payment by id"
    );
  }

  async create(
    input: CreateDebtPaymentInput,
    userId: string
  ): Promise<DebtPayment> {
    await this.validateUser(userId);

    if (!input.debtId) {
      throw new ValidationError("Debt ID is required");
    }

    if (input.amount <= 0) {
      throw new ValidationError("Payment amount must be greater than 0");
    }

    if (input.principalPaid < 0 || input.interestPaid < 0) {
      throw new ValidationError(
        "Principal and interest amounts cannot be negative"
      );
    }

    // Verify debt exists and belongs to user
    const { data: debt, error: debtError } = await this.supabase
      .from("debts")
      .select("id")
      .eq("id", input.debtId)
      .eq("user_id", userId)
      .single();

    if (debtError || !debt) {
      throw new ValidationError("Debt not found or access denied");
    }

    const paymentData = {
      debt_id: input.debtId,
      user_id: userId,
      transaction_id: input.transactionId || null,
      amount: input.amount,
      principal_paid: input.principalPaid,
      interest_paid: input.interestPaid,
      payment_date: formatDateForDatabase(input.paymentDate),
      is_scheduled: input.isScheduled || false,
      notes: input.notes || null,
    };

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("debt_payments")
          .insert(paymentData)
          .select()
          .single(),
      "create payment"
    );
  }

  async update(
    id: string,
    debtId: string,
    input: UpdateDebtPaymentInput,
    userId: string
  ): Promise<DebtPayment> {
    await this.validateId(id);
    await this.validateUser(userId);

    if (input.amount !== undefined && input.amount <= 0) {
      throw new ValidationError("Payment amount must be greater than 0");
    }

    if (
      input.principalPaid !== undefined &&
      (input.principalPaid < 0 || input.interestPaid !== undefined)
    ) {
      // Validate both if one is provided
      if (
        input.interestPaid !== undefined &&
        (input.interestPaid < 0 ||
          input.principalPaid + input.interestPaid !== input.amount)
      ) {
        throw new ValidationError(
          "Principal and interest must sum to payment amount"
        );
      }
    }

    const updateData: Partial<DebtPayment> = {};

    if (input.amount !== undefined) {
      updateData.amount = input.amount;
    }
    if (input.principalPaid !== undefined) {
      updateData.principal_paid = input.principalPaid;
    }
    if (input.interestPaid !== undefined) {
      updateData.interest_paid = input.interestPaid;
    }
    if (input.paymentDate !== undefined) {
      updateData.payment_date = formatDateForDatabase(input.paymentDate);
    }
    if (input.isScheduled !== undefined) {
      updateData.is_scheduled = input.isScheduled;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("debt_payments")
          .update(updateData)
          .eq("id", id)
          .eq("debt_id", debtId)
          .eq("user_id", userId)
          .select()
          .single(),
      "update payment"
    );
  }

  async delete(id: string, debtId: string, userId: string): Promise<void> {
    await this.validateId(id);
    await this.validateUser(userId);

    const { error } = await this.supabase
      .from("debt_payments")
      .delete()
      .eq("id", id)
      .eq("debt_id", debtId)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "delete payment");
    }
  }

  async getTotalPaid(debtId: string, userId: string): Promise<number> {
    await this.validateId(debtId);
    await this.validateUser(userId);

    const { data, error } = await this.supabase
      .from("debt_payments")
      .select("amount")
      .eq("debt_id", debtId)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "calculate total payments");
    }

    return (data || []).reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
  }

  async autoDetectFromTransactions(
    debtId: string,
    ledgerId: string,
    userId: string
  ): Promise<DebtPayment[]> {
    await this.validateId(debtId);
    await this.validateUser(userId);

    // Get debt details
    const { data: debt, error: debtError } = await this.supabase
      .from("debts")
      .select("*")
      .eq("id", debtId)
      .eq("user_id", userId)
      .single();

    if (debtError || !debt) {
      throw new ValidationError("Debt not found or access denied");
    }

    // Get transactions from linked ledger that might be payments
    const { data: transactions, error: txnError } = await this.supabase
      .from("transactions")
      .select("*")
      .eq("ledger_id", ledgerId)
      .eq("user_id", userId)
      .eq("type", "expense")
      .order("date", { ascending: false });

    if (txnError) {
      await this.handleError(txnError, "fetch transactions for auto-detection");
    }

    // Filter transactions that could be payments
    // This is a simple heuristic - could be enhanced with ML or pattern matching
    const potentialPayments = (transactions || []).filter((txn) => {
      // Check if transaction amount matches minimum payment or is close
      const amount = Number(txn.amount);
      const minPayment = debt.minimum_payment
        ? Number(debt.minimum_payment)
        : 0;

      // Match if amount is close to minimum payment or is a round number
      return (
        (minPayment > 0 && Math.abs(amount - minPayment) < 0.01) ||
        amount % 100 === 0 // Round hundreds
      );
    });

    // Return potential payments (user will need to confirm)
    return potentialPayments.map((txn) => ({
      id: "", // Will be created when confirmed
      debt_id: debtId,
      user_id: userId,
      transaction_id: txn.id,
      amount: Number(txn.amount),
      principal_paid: 0, // Will be calculated
      interest_paid: 0, // Will be calculated
      payment_date: txn.date,
      is_scheduled: false,
      notes: `Auto-detected from transaction: ${txn.description}`,
      created_at: txn.created_at,
      updated_at: txn.updated_at,
    })) as DebtPayment[];
  }
}
