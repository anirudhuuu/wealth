"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  useMarkScheduleAsMissed,
  useMarkScheduleAsPaid,
  useSkipSchedule,
} from "@/hooks/use-debts";
import { getUpcomingPayments } from "@/lib/actions/debt-actions";
import type { Debt, DebtSchedule } from "@/lib/types";
import { formatCurrency, formatDate, parseDateFromDatabase } from "@/lib/utils";
import { Calendar, Check, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UpcomingPaymentsListProps {
  debts: Debt[];
}

export function UpcomingPaymentsList({ debts }: UpcomingPaymentsListProps) {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["upcoming-payments"],
    queryFn: () => getUpcomingPayments(30),
  });

  const markAsPaidMutation = useMarkScheduleAsPaid();
  const markAsMissedMutation = useMarkScheduleAsMissed();
  const skipMutation = useSkipSchedule();

  // Group schedules by debt
  const schedulesByDebt = schedules.reduce((acc, schedule) => {
    const debt = debts.find((d) => d.id === schedule.debt_id);
    if (debt) {
      if (!acc[debt.id]) {
        acc[debt.id] = { debt, schedules: [] };
      }
      acc[debt.id].schedules.push(schedule);
    }
    return acc;
  }, {} as Record<string, { debt: Debt; schedules: DebtSchedule[] }>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyMedia variant="icon">
              <Calendar className="h-8 w-8 opacity-50" />
            </EmptyMedia>
            <EmptyContent>
              <EmptyTitle>No upcoming payments</EmptyTitle>
              <EmptyDescription>
                All scheduled payments are up to date
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.values(schedulesByDebt).map(
            ({ debt, schedules: debtSchedules }) => (
              <div key={debt.id} className="space-y-2">
                <h4 className="font-semibold text-sm">{debt.name}</h4>
                {debtSchedules.map((schedule) => {
                  const scheduledDate = parseDateFromDatabase(
                    schedule.scheduled_date
                  );
                  const daysUntil = Math.ceil(
                    (scheduledDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isOverdue = daysUntil < 0;

                  return (
                    <div
                      key={schedule.id}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        isOverdue
                          ? "bg-destructive/10 border-destructive/20"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {formatCurrency(
                              Number(schedule.scheduled_amount),
                              debt.currency
                            )}
                          </span>
                          <span
                            className={`text-xs ml-2 ${
                              isOverdue
                                ? "text-destructive font-semibold"
                                : daysUntil < 7
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatDate(scheduledDate)}
                            {isOverdue
                              ? " (Overdue)"
                              : daysUntil === 0
                              ? " (Today)"
                              : ` (${daysUntil} days)`}
                          </span>
                        </div>
                        {schedule.reminder_sent && (
                          <span className="text-xs text-muted-foreground">
                            Reminder sent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {schedule.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => {
                                // Mark as paid - would need payment ID
                                // For now, just skip
                              }}
                              title="Mark as paid"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => {
                                skipMutation.mutate(schedule.id);
                              }}
                              title="Skip payment"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
