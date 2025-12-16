import { formatDateForDatabase } from "@/lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../errors";
import { DebtSchedule } from "../types";
import { BaseRepository } from "./base-repository";

export class DebtScheduleRepository extends BaseRepository<DebtSchedule> {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  protected getTableName(): string {
    return "debt_schedules";
  }

  async getByDebtId(debtId: string, userId: string): Promise<DebtSchedule[]> {
    await this.validateId(debtId);
    await this.validateUser(userId);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("debt_schedules")
          .select("*")
          .eq("debt_id", debtId)
          .eq("user_id", userId)
          .order("scheduled_date", { ascending: true }),
      "fetch schedules by debt"
    );
  }

  async getUpcoming(
    userId: string,
    daysAhead: number = 30
  ): Promise<DebtSchedule[]> {
    await this.validateUser(userId);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("debt_schedules")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "pending")
          .gte("scheduled_date", formatDateForDatabase(new Date()))
          .lte("scheduled_date", formatDateForDatabase(futureDate))
          .order("scheduled_date", { ascending: true }),
      "fetch upcoming schedules"
    );
  }

  async create(
    debtId: string,
    scheduledDate: Date,
    scheduledAmount: number,
    userId: string
  ): Promise<DebtSchedule> {
    await this.validateId(debtId);
    await this.validateUser(userId);

    if (scheduledAmount <= 0) {
      throw new ValidationError("Scheduled amount must be greater than 0");
    }

    // Verify debt exists
    const { data: debt, error: debtError } = await this.supabase
      .from("debts")
      .select("id")
      .eq("id", debtId)
      .eq("user_id", userId)
      .single();

    if (debtError || !debt) {
      throw new ValidationError("Debt not found or access denied");
    }

    const scheduleData = {
      debt_id: debtId,
      user_id: userId,
      scheduled_date: formatDateForDatabase(scheduledDate),
      scheduled_amount: scheduledAmount,
      status: "pending" as const,
      reminder_sent: false,
    };

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("debt_schedules")
          .insert(scheduleData)
          .select()
          .single(),
      "create schedule"
    );
  }

  async markAsPaid(
    scheduleId: string,
    paymentId: string,
    userId: string
  ): Promise<DebtSchedule> {
    await this.validateId(scheduleId);
    await this.validateUser(userId);

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("debt_schedules")
          .update({
            status: "paid",
            payment_id: paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", scheduleId)
          .eq("user_id", userId)
          .select()
          .single(),
      "mark schedule as paid"
    );
  }

  async markAsMissed(
    scheduleId: string,
    userId: string
  ): Promise<DebtSchedule> {
    await this.validateId(scheduleId);
    await this.validateUser(userId);

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("debt_schedules")
          .update({
            status: "missed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", scheduleId)
          .eq("user_id", userId)
          .select()
          .single(),
      "mark schedule as missed"
    );
  }

  async skip(scheduleId: string, userId: string): Promise<DebtSchedule> {
    await this.validateId(scheduleId);
    await this.validateUser(userId);

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("debt_schedules")
          .update({
            status: "skipped",
            updated_at: new Date().toISOString(),
          })
          .eq("id", scheduleId)
          .eq("user_id", userId)
          .select()
          .single(),
      "skip schedule"
    );
  }

  async generateSchedules(
    debtId: string,
    userId: string,
    startDate: Date,
    endDate: Date | null,
    frequency: "weekly" | "biweekly" | "monthly" | "yearly",
    amount: number
  ): Promise<DebtSchedule[]> {
    await this.validateId(debtId);
    await this.validateUser(userId);

    const schedules: DebtSchedule[] = [];
    const currentDate = new Date(startDate);
    const maxDate = endDate || new Date(currentDate.getFullYear() + 10, 0, 1); // 10 years default

    let daysToAdd: number;
    switch (frequency) {
      case "weekly":
        daysToAdd = 7;
        break;
      case "biweekly":
        daysToAdd = 14;
        break;
      case "monthly":
        daysToAdd = 30;
        break;
      case "yearly":
        daysToAdd = 365;
        break;
    }

    while (currentDate <= maxDate) {
      try {
        const schedule = await this.create(
          debtId,
          new Date(currentDate),
          amount,
          userId
        );
        schedules.push(schedule);

        currentDate.setDate(currentDate.getDate() + daysToAdd);
      } catch (error) {
        // Skip if schedule already exists or other error
        currentDate.setDate(currentDate.getDate() + daysToAdd);
      }
    }

    return schedules;
  }

  async delete(scheduleId: string, userId: string): Promise<void> {
    await this.validateId(scheduleId);
    await this.validateUser(userId);

    const { error } = await this.supabase
      .from("debt_schedules")
      .delete()
      .eq("id", scheduleId)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "delete schedule");
    }
  }
}
