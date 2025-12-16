"use server";

import { requireAuth } from "@/lib/auth";
import { createRepositories } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateGoalContributionInput,
  CreateGoalInput,
  Goal,
  GoalContribution,
  GoalFilters,
  GoalProgress,
  UpdateGoalContributionInput,
  UpdateGoalInput,
} from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getGoals(filters?: GoalFilters): Promise<Goal[]> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.goals.getWithFilters(user.id, filters || {});
}

export async function getGoal(id: string): Promise<Goal> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.goals.getById(id, user.id);
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const goal = await repositories.goals.create(input, user.id);
  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return goal;
}

export async function updateGoal(
  id: string,
  input: UpdateGoalInput
): Promise<Goal> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const goal = await repositories.goals.update(id, input, user.id);
  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return goal;
}

export async function deleteGoal(id: string): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  await repositories.goals.delete(id, user.id);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function getGoalProgress(goalId: string): Promise<GoalProgress> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.goals.getProgress(goalId, user.id);
}

export async function getGoalContributions(
  goalId: string
): Promise<GoalContribution[]> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  return repositories.goalContributions.getByGoalId(goalId, user.id);
}

export async function addContribution(
  input: CreateGoalContributionInput
): Promise<GoalContribution> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const contribution = await repositories.goalContributions.create(
    input,
    user.id
  );
  revalidatePath("/goals");
  revalidatePath(`/goals/${input.goalId}`);
  revalidatePath("/dashboard");

  return contribution;
}

export async function updateContribution(
  id: string,
  goalId: string,
  input: UpdateGoalContributionInput
): Promise<GoalContribution> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  const contribution = await repositories.goalContributions.update(
    id,
    goalId,
    input,
    user.id
  );
  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/dashboard");

  return contribution;
}

export async function deleteContribution(
  id: string,
  goalId: string
): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  const repositories = createRepositories(supabase);

  await repositories.goalContributions.delete(id, goalId, user.id);
  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/dashboard");
}
