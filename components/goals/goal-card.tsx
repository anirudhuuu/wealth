"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDeleteGoal } from "@/hooks/use-goals";
import type { Goal } from "@/lib/types";
import { formatCurrency, formatDate, parseDateFromDatabase } from "@/lib/utils";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddContributionDialog } from "./add-contribution-dialog";
import { EditGoalDialog } from "./edit-goal-dialog";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const deleteGoalMutation = useDeleteGoal();

  const targetAmount = Number(goal.target_amount);
  const currentAmount = Number(goal.current_amount);
  const percentage =
    targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const amountRemaining = Math.max(0, targetAmount - currentAmount);
  const isCompleted = currentAmount >= targetAmount;

  const targetDate = goal.target_date
    ? parseDateFromDatabase(goal.target_date)
    : null;
  const daysRemaining =
    targetDate && !isCompleted
      ? Math.ceil(
          (targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "paused":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setDeletingGoalId(goalId);
    deleteGoalMutation.mutate(goalId, {
      onSettled: () => {
        setDeletingGoalId(null);
      },
    });
  };

  return (
    <>
      <div className="rounded-lg border p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{goal.name}</h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`ml-2 shrink-0 ${getStatusColor(goal.status)}`}
          >
            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{percentage.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(100, Math.max(0, percentage))} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(currentAmount, goal.currency)} /{" "}
              {formatCurrency(targetAmount, goal.currency)}
            </span>
            <span className="text-muted-foreground">
              {formatCurrency(amountRemaining, goal.currency)} remaining
            </span>
          </div>
        </div>

        {/* Target Date */}
        {targetDate && (
          <div className="text-sm">
            <span className="text-muted-foreground">Target Date: </span>
            <span className="font-medium">{formatDate(targetDate)}</span>
            {daysRemaining !== null && (
              <span
                className={`ml-2 ${
                  daysRemaining < 0
                    ? "text-destructive"
                    : daysRemaining < 30
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-muted-foreground"
                }`}
              >
                ({daysRemaining < 0 ? "Overdue" : `${daysRemaining} days left`})
              </span>
            )}
          </div>
        )}

        {/* Milestones */}
        {goal.milestones && goal.milestones.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Milestones:</span>
            <div className="flex flex-wrap gap-1">
              {goal.milestones.map((milestone, index) => {
                const milestoneReached = currentAmount >= milestone.amount;
                return (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`text-xs ${
                      milestoneReached
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-muted"
                    }`}
                  >
                    {milestone.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddContribution(true)}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Money
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEditDialog(true)}
            className="h-8 w-8 p-0"
            title="Edit goal"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                title="Delete goal"
                disabled={deletingGoalId === goal.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{goal.name}"? This will
                  permanently delete the goal and all its contributions.
                  <br />
                  <br />
                  <strong>This action cannot be undone.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-row gap-2">
                <AlertDialogCancel
                  disabled={deletingGoalId === goal.id}
                  className="flex-1"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteGoal(goal.id)}
                  disabled={deletingGoalId === goal.id}
                  className="bg-red-600 hover:bg-red-700 flex-1"
                >
                  {deletingGoalId === goal.id ? "Deleting..." : "Delete Goal"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <AddContributionDialog
        open={showAddContribution}
        onOpenChange={setShowAddContribution}
        goal={goal}
      />

      <EditGoalDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        goal={goal}
      />
    </>
  );
}
