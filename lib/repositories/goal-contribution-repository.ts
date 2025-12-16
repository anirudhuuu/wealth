import { formatDateForDatabase } from "@/lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../errors";
import {
  CreateGoalContributionInput,
  GoalContribution,
  UpdateGoalContributionInput,
} from "../types";
import { BaseRepository } from "./base-repository";

export class GoalContributionRepository extends BaseRepository<GoalContribution> {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  protected getTableName(): string {
    return "goal_contributions";
  }

  async getByGoalId(
    goalId: string,
    userId: string
  ): Promise<GoalContribution[]> {
    await this.validateId(goalId);
    await this.validateUser(userId);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("goal_contributions")
          .select("*")
          .eq("goal_id", goalId)
          .eq("user_id", userId)
          .order("date", { ascending: false }),
      "fetch contributions by goal"
    );
  }

  async getById(
    id: string,
    goalId: string,
    userId: string
  ): Promise<GoalContribution> {
    await this.validateId(id);
    await this.validateUser(userId);

    return this.executeQuery(
      async () =>
        await this.supabase
          .from("goal_contributions")
          .select("*")
          .eq("id", id)
          .eq("goal_id", goalId)
          .eq("user_id", userId)
          .single(),
      "fetch contribution by id"
    );
  }

  async create(
    input: CreateGoalContributionInput,
    userId: string
  ): Promise<GoalContribution> {
    await this.validateUser(userId);

    if (!input.goalId) {
      throw new ValidationError("Goal ID is required");
    }

    if (input.amount <= 0) {
      throw new ValidationError("Contribution amount must be greater than 0");
    }

    // Verify goal exists and belongs to user
    const { data: goal, error: goalError } = await this.supabase
      .from("goals")
      .select("id")
      .eq("id", input.goalId)
      .eq("user_id", userId)
      .single();

    if (goalError || !goal) {
      throw new ValidationError("Goal not found or access denied");
    }

    const contributionData = {
      goal_id: input.goalId,
      user_id: userId,
      amount: input.amount,
      date: formatDateForDatabase(input.date),
      notes: input.notes || null,
    };

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("goal_contributions")
          .insert(contributionData)
          .select()
          .single(),
      "create contribution"
    );
  }

  async update(
    id: string,
    goalId: string,
    input: UpdateGoalContributionInput,
    userId: string
  ): Promise<GoalContribution> {
    await this.validateId(id);
    await this.validateUser(userId);

    if (input.amount !== undefined && input.amount <= 0) {
      throw new ValidationError("Contribution amount must be greater than 0");
    }

    const updateData: Partial<GoalContribution> = {};

    if (input.amount !== undefined) {
      updateData.amount = input.amount;
    }
    if (input.date !== undefined) {
      updateData.date = formatDateForDatabase(input.date);
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("goal_contributions")
          .update(updateData)
          .eq("id", id)
          .eq("goal_id", goalId)
          .eq("user_id", userId)
          .select()
          .single(),
      "update contribution"
    );
  }

  async delete(id: string, goalId: string, userId: string): Promise<void> {
    await this.validateId(id);
    await this.validateUser(userId);

    const { error } = await this.supabase
      .from("goal_contributions")
      .delete()
      .eq("id", id)
      .eq("goal_id", goalId)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "delete contribution");
    }
  }

  async getTotalByGoal(goalId: string, userId: string): Promise<number> {
    await this.validateId(goalId);
    await this.validateUser(userId);

    const { data, error } = await this.supabase
      .from("goal_contributions")
      .select("amount")
      .eq("goal_id", goalId)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "calculate total contributions");
    }

    return (data || []).reduce(
      (sum, contribution) => sum + Number(contribution.amount),
      0
    );
  }
}
