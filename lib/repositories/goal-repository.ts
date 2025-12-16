import { formatDateForDatabase } from "@/lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../errors";
import {
  CreateGoalInput,
  Goal,
  GoalFilters,
  GoalProgress,
  UpdateGoalInput,
} from "../types";
import { BaseRepository } from "./base-repository";

export class GoalRepository extends BaseRepository<Goal> {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  protected getTableName(): string {
    return "goals";
  }

  async getByUserId(userId: string): Promise<Goal[]> {
    await this.validateUser(userId);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("goals")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      "fetch goals by user"
    );
  }

  async getById(id: string, userId: string): Promise<Goal> {
    await this.validateId(id);
    await this.validateUser(userId);

    return this.executeQuery(
      async () =>
        await this.supabase
          .from("goals")
          .select("*")
          .eq("id", id)
          .eq("user_id", userId)
          .single(),
      "fetch goal by id"
    );
  }

  async create(input: CreateGoalInput, userId: string): Promise<Goal> {
    await this.validateUser(userId);

    if (!input.name?.trim()) {
      throw new ValidationError("Goal name is required");
    }

    if (input.targetAmount <= 0) {
      throw new ValidationError("Target amount must be greater than 0");
    }

    const goalData = {
      user_id: userId,
      name: input.name.trim(),
      target_amount: input.targetAmount,
      current_amount: 0,
      currency: input.currency || "INR",
      target_date: input.targetDate
        ? formatDateForDatabase(input.targetDate)
        : null,
      description: input.description || null,
      status: "active" as const,
      milestones: input.milestones || null,
    };

    return this.executeMutation(
      async () =>
        await this.supabase.from("goals").insert(goalData).select().single(),
      "create goal"
    );
  }

  async update(
    id: string,
    input: UpdateGoalInput,
    userId: string
  ): Promise<Goal> {
    await this.validateId(id);
    await this.validateUser(userId);

    if (input.name !== undefined && !input.name?.trim()) {
      throw new ValidationError("Goal name cannot be empty");
    }

    if (input.targetAmount !== undefined && input.targetAmount <= 0) {
      throw new ValidationError("Target amount must be greater than 0");
    }

    const updateData: Partial<Goal> = {};

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }
    if (input.targetAmount !== undefined) {
      updateData.target_amount = input.targetAmount;
    }
    if (input.currency !== undefined) {
      updateData.currency = input.currency;
    }
    if (input.targetDate !== undefined) {
      updateData.target_date = input.targetDate
        ? formatDateForDatabase(input.targetDate)
        : null;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.milestones !== undefined) {
      updateData.milestones = input.milestones;
    }

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("goals")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single(),
      "update goal"
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.validateId(id);
    await this.validateUser(userId);

    const { error } = await this.supabase
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "delete goal");
    }
  }

  async getWithFilters(
    userId: string,
    filters: GoalFilters = {}
  ): Promise<Goal[]> {
    await this.validateUser(userId);

    let query = this.supabase.from("goals").select("*").eq("user_id", userId);

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.currency) {
      query = query.eq("currency", filters.currency);
    }

    if (filters.minTargetAmount !== undefined) {
      query = query.gte("target_amount", filters.minTargetAmount);
    }

    if (filters.maxTargetAmount !== undefined) {
      query = query.lte("target_amount", filters.maxTargetAmount);
    }

    return this.executeQueryList(
      async () => await query.order("created_at", { ascending: false }),
      "fetch goals with filters"
    );
  }

  async getProgress(goalId: string, userId: string): Promise<GoalProgress> {
    await this.validateId(goalId);
    await this.validateUser(userId);

    const goal = await this.getById(goalId, userId);
    const targetAmount = Number(goal.target_amount);
    const currentAmount = Number(goal.current_amount);
    const targetDate = goal.target_date ? new Date(goal.target_date) : null;

    // Calculate percentage
    const percentage =
      targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

    // Calculate amount remaining
    const amountRemaining = Math.max(0, targetAmount - currentAmount);

    // Calculate days remaining
    let daysRemaining: number | null = null;
    if (targetDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(targetDate);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Calculate estimated completion date based on average contribution rate
    let estimatedCompletionDate: Date | null = null;
    if (amountRemaining > 0 && targetDate) {
      // Get contributions to calculate average rate
      const { data: contributions } = await this.supabase
        .from("goal_contributions")
        .select("amount, date")
        .eq("goal_id", goalId)
        .eq("user_id", userId)
        .order("date", { ascending: true });

      if (contributions && contributions.length > 0) {
        const totalContributed = contributions.reduce(
          (sum, c) => sum + Number(c.amount),
          0
        );
        const firstContribution = new Date(contributions[0].date);
        const lastContribution = new Date(
          contributions[contributions.length - 1].date
        );
        const daysElapsed =
          (lastContribution.getTime() - firstContribution.getTime()) /
          (1000 * 60 * 60 * 24);

        if (daysElapsed > 0 && totalContributed > 0) {
          const dailyRate = totalContributed / daysElapsed;
          if (dailyRate > 0) {
            const daysNeeded = amountRemaining / dailyRate;
            const estimated = new Date();
            estimated.setDate(estimated.getDate() + daysNeeded);
            estimatedCompletionDate = estimated;
          }
        }
      }
    }

    const isCompleted = currentAmount >= targetAmount;
    const isOverdue =
      targetDate !== null &&
      daysRemaining !== null &&
      daysRemaining < 0 &&
      !isCompleted;

    return {
      percentage: Math.min(100, Math.max(0, percentage)),
      amountRemaining,
      daysRemaining,
      estimatedCompletionDate,
      isCompleted,
      isOverdue,
    };
  }
}
