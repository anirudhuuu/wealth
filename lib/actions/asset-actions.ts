"use server";

import { requireAuth } from "@/lib/auth";
import { createRepositories } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";
import type { Asset, CreateAssetInput, UpdateAssetInput } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getAssets(): Promise<Asset[]> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.assets.getWithFilters(user.id);
}

export async function getAsset(id: string): Promise<Asset> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.assets.getById(id, user.id);
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const asset = await repositories.assets.create(input, user.id);
  revalidatePath("/assets");
  revalidatePath("/dashboard");

  return asset;
}

export async function updateAsset(
  id: string,
  input: UpdateAssetInput
): Promise<Asset> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const asset = await repositories.assets.update(id, input, user.id);
  revalidatePath("/assets");
  revalidatePath("/dashboard");

  return asset;
}

export async function deleteAsset(id: string): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  await repositories.assets.delete(id, user.id);
  revalidatePath("/assets");
  revalidatePath("/dashboard");
}
