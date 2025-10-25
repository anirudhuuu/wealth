"use server";

import { requireAuth } from "@/lib/auth";
import { createRepositories } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";
import type { CreateLedgerInput, Ledger, UpdateLedgerInput } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getLedgers(): Promise<Ledger[]> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.ledgers.getWithFilters(user.id);
}

export async function getLedger(id: string): Promise<Ledger> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.ledgers.getById(id, user.id);
}

export async function createLedger(input: CreateLedgerInput): Promise<Ledger> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const ledger = await repositories.ledgers.create(input, user.id);
  revalidatePath("/ledgers");
  revalidatePath("/dashboard");

  return ledger;
}

export async function updateLedger(
  id: string,
  input: UpdateLedgerInput
): Promise<Ledger> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const ledger = await repositories.ledgers.update(id, input, user.id);
  revalidatePath("/ledgers");
  revalidatePath("/dashboard");

  return ledger;
}

export async function deleteLedger(id: string): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  await repositories.ledgers.delete(id, user.id);
  revalidatePath("/ledgers");
  revalidatePath("/dashboard");
}
