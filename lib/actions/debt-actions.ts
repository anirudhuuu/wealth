"use server";

import { requireAuth } from "@/lib/auth";
import { createRepositories } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateDebtInput,
  CreateDebtPaymentInput,
  Debt,
  DebtFilters,
  DebtPayment,
  DebtProgress,
  DebtSchedule,
  PayoffStrategy,
  UpdateDebtInput,
  UpdateDebtPaymentInput,
} from "@/lib/types";
import {
  calculateAvalancheStrategy,
  calculateSnowballStrategy,
} from "@/lib/utils/debt-calculations";
import { revalidatePath } from "next/cache";

export async function getDebts(filters?: DebtFilters): Promise<Debt[]> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.debts.getWithFilters(user.id, filters || {});
}

export async function getDebt(id: string): Promise<Debt> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.debts.getById(id, user.id);
}

export async function createDebt(input: CreateDebtInput): Promise<Debt> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const debt = await repositories.debts.create(input, user.id);
  revalidatePath("/debts");
  revalidatePath("/dashboard");

  return debt;
}

export async function updateDebt(
  id: string,
  input: UpdateDebtInput
): Promise<Debt> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const debt = await repositories.debts.update(id, input, user.id);
  revalidatePath("/debts");
  revalidatePath("/dashboard");

  return debt;
}

export async function deleteDebt(id: string): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  await repositories.debts.delete(id, user.id);
  revalidatePath("/debts");
  revalidatePath("/dashboard");
}

export async function getDebtProgress(debtId: string): Promise<DebtProgress> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.debts.getProgress(debtId, user.id);
}

export async function calculatePayoffStrategy(
  debtIds: string[],
  strategy: "snowball" | "avalanche",
  extraPayment: number = 0
): Promise<PayoffStrategy> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  // Fetch all debts
  const debts = await Promise.all(
    debtIds.map((id) => repositories.debts.getById(id, user.id))
  );

  // Convert to format expected by calculation functions
  const debtsWithBalance = debts.map((debt) => ({
    ...debt,
    currentBalance: Number(debt.current_balance),
    minimumPayment: Number(debt.minimum_payment || 0),
    interestRate: Number(debt.interest_rate),
    interestType: debt.interest_type,
    compoundingFrequency: debt.compounding_frequency,
    paymentFrequency: debt.payment_frequency,
  }));

  if (strategy === "snowball") {
    return calculateSnowballStrategy(debtsWithBalance, extraPayment);
  } else {
    return calculateAvalancheStrategy(debtsWithBalance, extraPayment);
  }
}

export async function getDebtPayments(debtId: string): Promise<DebtPayment[]> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.debtPayments.getByDebtId(debtId, user.id);
}

export async function addPayment(
  input: CreateDebtPaymentInput
): Promise<DebtPayment> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const payment = await repositories.debtPayments.create(input, user.id);
  revalidatePath("/debts");
  revalidatePath(`/debts/${input.debtId}`);
  revalidatePath("/dashboard");

  return payment;
}

export async function updatePayment(
  id: string,
  debtId: string,
  input: UpdateDebtPaymentInput
): Promise<DebtPayment> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const payment = await repositories.debtPayments.update(
    id,
    debtId,
    input,
    user.id
  );
  revalidatePath("/debts");
  revalidatePath(`/debts/${debtId}`);
  revalidatePath("/dashboard");

  return payment;
}

export async function deletePayment(id: string, debtId: string): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  await repositories.debtPayments.delete(id, debtId, user.id);
  revalidatePath("/debts");
  revalidatePath(`/debts/${debtId}`);
  revalidatePath("/dashboard");
}

export async function getUpcomingPayments(
  daysAhead: number = 30
): Promise<DebtSchedule[]> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.debtSchedules.getUpcoming(user.id, daysAhead);
}

export async function markScheduleAsPaid(
  scheduleId: string,
  paymentId: string
): Promise<DebtSchedule> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const schedule = await repositories.debtSchedules.markAsPaid(
    scheduleId,
    paymentId,
    user.id
  );
  revalidatePath("/debts");
  revalidatePath("/dashboard");

  return schedule;
}

export async function markScheduleAsMissed(
  scheduleId: string
): Promise<DebtSchedule> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const schedule = await repositories.debtSchedules.markAsMissed(
    scheduleId,
    user.id
  );
  revalidatePath("/debts");
  revalidatePath("/dashboard");

  return schedule;
}

export async function skipSchedule(scheduleId: string): Promise<DebtSchedule> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const schedule = await repositories.debtSchedules.skip(scheduleId, user.id);
  revalidatePath("/debts");
  revalidatePath("/dashboard");

  return schedule;
}

export async function autoDetectPayments(
  debtId: string,
  ledgerId: string
): Promise<DebtPayment[]> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.debtPayments.autoDetectFromTransactions(
    debtId,
    ledgerId,
    user.id
  );
}
