"use server";

import { requireAuth } from "@/lib/auth";
import { createRepositories } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UpdateProfileInput } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getProfile(): Promise<Profile> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.users.getProfile(user.id);
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<Profile> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const profile = await repositories.users.updateProfile(input, user.id);
  revalidatePath("/settings");

  return profile;
}
