import { formatDateForDatabase } from "@/lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../errors";
import {
  CreateDebtInput,
  Debt,
  DebtFilters,
  DebtProgress,
  UpdateDebtInput,
} from "../types";
import { BaseRepository } from "./base-repository";

export class DebtRepository extends BaseRepository<Debt> {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  protected getTableName(): string {
    return "debts";
  }

  async getByUserId(userId: string): Promise<Debt[]> {
    await this.validateUser(userId);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("debts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      "fetch debts by user"
    );
  }

  async getById(id: string, userId: string): Promise<Debt> {
    await this.validateId(id);
    await this.validateUser(userId);

    return this.executeQuery(
      async () =>
        await this.supabase
          .from("debts")
          .select("*")
          .eq("id", id)
          .eq("user_id", userId)
          .single(),
      "fetch debt by id"
    );
  }

  async create(input: CreateDebtInput, userId: string): Promise<Debt> {
    await this.validateUser(userId);

    if (!input.name?.trim()) {
      throw new ValidationError("Debt name is required");
    }

    if (input.principalAmount <= 0) {
      throw new ValidationError("Principal amount must be greater than 0");
    }

    if (input.interestRate < 0 || input.interestRate > 100) {
      throw new ValidationError("Interest rate must be between 0 and 100");
    }

    const debtData = {
      user_id: userId,
      ledger_id: input.ledgerId || null,
      name: input.name.trim(),
      creditor_name: input.creditorName || null,
      principal_amount: input.principalAmount,
      current_balance: input.principalAmount, // Start with full principal
      interest_rate: input.interestRate,
      interest_type: input.interestType,
      compounding_frequency: input.compoundingFrequency || null,
      currency: input.currency || "INR",
      start_date: formatDateForDatabase(input.startDate),
      maturity_date: input.maturityDate
        ? formatDateForDatabase(input.maturityDate)
        : null,
      minimum_payment: input.minimumPayment || null,
      payment_frequency: input.paymentFrequency,
      next_payment_date: input.nextPaymentDate
        ? formatDateForDatabase(input.nextPaymentDate)
        : null,
      payoff_strategy: input.payoffStrategy || "minimum_only",
      status: "active" as const,
      notes: input.notes || null,
    };

    return this.executeMutation(
      async () =>
        await this.supabase.from("debts").insert(debtData).select().single(),
      "create debt"
    );
  }

  async update(
    id: string,
    input: UpdateDebtInput,
    userId: string
  ): Promise<Debt> {
    await this.validateId(id);
    await this.validateUser(userId);

    if (input.name !== undefined && !input.name?.trim()) {
      throw new ValidationError("Debt name cannot be empty");
    }

    if (input.principalAmount !== undefined && input.principalAmount <= 0) {
      throw new ValidationError("Principal amount must be greater than 0");
    }

    if (
      input.interestRate !== undefined &&
      (input.interestRate < 0 || input.interestRate > 100)
    ) {
      throw new ValidationError("Interest rate must be between 0 and 100");
    }

    const updateData: Partial<Debt> = {};

    if (input.ledgerId !== undefined) {
      updateData.ledger_id = input.ledgerId;
    }
    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }
    if (input.creditorName !== undefined) {
      updateData.creditor_name = input.creditorName;
    }
    if (input.principalAmount !== undefined) {
      updateData.principal_amount = input.principalAmount;
    }
    if (input.interestRate !== undefined) {
      updateData.interest_rate = input.interestRate;
    }
    if (input.interestType !== undefined) {
      updateData.interest_type = input.interestType;
    }
    if (input.compoundingFrequency !== undefined) {
      updateData.compounding_frequency = input.compoundingFrequency;
    }
    if (input.currency !== undefined) {
      updateData.currency = input.currency;
    }
    if (input.startDate !== undefined) {
      updateData.start_date = formatDateForDatabase(input.startDate);
    }
    if (input.maturityDate !== undefined) {
      updateData.maturity_date = input.maturityDate
        ? formatDateForDatabase(input.maturityDate)
        : null;
    }
    if (input.minimumPayment !== undefined) {
      updateData.minimum_payment = input.minimumPayment;
    }
    if (input.paymentFrequency !== undefined) {
      updateData.payment_frequency = input.paymentFrequency;
    }
    if (input.nextPaymentDate !== undefined) {
      updateData.next_payment_date = input.nextPaymentDate
        ? formatDateForDatabase(input.nextPaymentDate)
        : null;
    }
    if (input.payoffStrategy !== undefined) {
      updateData.payoff_strategy = input.payoffStrategy;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("debts")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single(),
      "update debt"
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.validateId(id);
    await this.validateUser(userId);

    const { error } = await this.supabase
      .from("debts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "delete debt");
    }
  }

  async getWithFilters(
    userId: string,
    filters: DebtFilters = {}
  ): Promise<Debt[]> {
    await this.validateUser(userId);

    let query = this.supabase.from("debts").select("*").eq("user_id", userId);

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.currency) {
      query = query.eq("currency", filters.currency);
    }

    if (filters.payoffStrategy) {
      query = query.eq("payoff_strategy", filters.payoffStrategy);
    }

    if (filters.ledgerId) {
      query = query.eq("ledger_id", filters.ledgerId);
    }

    return this.executeQueryList(
      async () => await query.order("created_at", { ascending: false }),
      "fetch debts with filters"
    );
  }

  async getProgress(debtId: string, userId: string): Promise<DebtProgress> {
    await this.validateId(debtId);
    await this.validateUser(userId);

    const debt = await this.getById(debtId, userId);
    const principalAmount = Number(debt.principal_amount);
    const currentBalance = Number(debt.current_balance);

    // Get all payments for this debt
    const { data: payments } = await this.supabase
      .from("debt_payments")
      .select("amount, principal_paid, interest_paid")
      .eq("debt_id", debtId)
      .eq("user_id", userId);

    const totalPaid =
      (payments || []).reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const totalInterestPaid =
      (payments || []).reduce((sum, p) => sum + Number(p.interest_paid), 0) ||
      0;

    // Calculate percentage paid
    const percentagePaid =
      principalAmount > 0
        ? ((principalAmount - currentBalance) / principalAmount) * 100
        : 0;

    // Calculate amount remaining
    const amountRemaining = Math.max(0, currentBalance);

    // Calculate projected payoff date (simplified - would need payment schedule)
    let projectedPayoffDate: Date | null = null;
    if (debt.next_payment_date && debt.minimum_payment) {
      const monthlyPayment = Number(debt.minimum_payment);
      if (monthlyPayment > 0) {
        const monthsRemaining = Math.ceil(amountRemaining / monthlyPayment);
        const nextPayment = new Date(debt.next_payment_date);
        projectedPayoffDate = new Date(
          nextPayment.getFullYear(),
          nextPayment.getMonth() + monthsRemaining,
          nextPayment.getDate()
        );
      }
    }

    // Calculate days remaining
    let daysRemaining: number | null = null;
    if (projectedPayoffDate) {
      const today = new Date();
      const diffTime = projectedPayoffDate.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const isPaidOff = currentBalance <= 0;

    // Calculate interest saved (simplified - would need comparison with minimum payments)
    const interestSaved = 0; // Placeholder - would calculate based on strategy

    return {
      percentagePaid: Math.min(100, Math.max(0, percentagePaid)),
      amountRemaining,
      totalPaid,
      totalInterestPaid,
      projectedPayoffDate,
      daysRemaining,
      isPaidOff,
      interestSaved,
    };
  }

  async getTotalDebt(userId: string, currency?: string): Promise<number> {
    await this.validateUser(userId);

    let query = this.supabase
      .from("debts")
      .select("current_balance")
      .eq("user_id", userId)
      .eq("status", "active");

    if (currency) {
      query = query.eq("currency", currency);
    }

    const { data, error } = await query;

    if (error) {
      await this.handleError(error, "calculate total debt");
    }

    return (data || []).reduce(
      (sum, debt) => sum + Number(debt.current_balance),
      0
    );
  }
}
