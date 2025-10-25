"use server";

import { requireAuth } from "@/lib/auth";
import { createRepositories } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getTransactions(): Promise<Transaction[]> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.transactions.getWithFilters(user.id);
}

export async function getTransaction(id: string): Promise<Transaction> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.transactions.getById(id, user.id);
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const transaction = await repositories.transactions.create(input, user.id);
  revalidatePath("/ledgers");
  revalidatePath("/dashboard");

  return transaction;
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput
): Promise<Transaction> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const transaction = await repositories.transactions.update(
    id,
    input,
    user.id
  );
  revalidatePath("/ledgers");
  revalidatePath("/dashboard");

  return transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  await repositories.transactions.delete(id, user.id);
  revalidatePath("/ledgers");
  revalidatePath("/dashboard");
}
