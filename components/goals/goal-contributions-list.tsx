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
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useDeleteContribution } from "@/hooks/use-goals";
import type { GoalContribution } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";

interface GoalContributionsListProps {
  goalId: string;
  contributions: GoalContribution[];
  currency: string;
}

export function GoalContributionsList({
  goalId,
  contributions,
  currency,
}: GoalContributionsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deletingContributionId, setDeletingContributionId] = useState<
    string | null
  >(null);
  const deleteContributionMutation = useDeleteContribution();

  const sortedContributions = [...contributions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDeleteContribution = async (contributionId: string) => {
    setDeletingContributionId(contributionId);
    deleteContributionMutation.mutate(
      { id: contributionId, goalId },
      {
        onSettled: () => {
          setDeletingContributionId(null);
        },
      }
    );
  };

  if (contributions.length === 0) {
    return (
      <div className="border-t pt-3 mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <span className="text-sm text-muted-foreground">
            Contributions (0)
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {isExpanded && (
          <div className="mt-2">
            <Empty>
              <EmptyMedia variant="icon">
                <Trash2 className="h-6 w-6 opacity-50" />
              </EmptyMedia>
              <EmptyContent>
                <EmptyTitle>No contributions yet</EmptyTitle>
                <EmptyDescription>
                  Add your first contribution to start tracking progress
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-t pt-3 mt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between"
      >
        <span className="text-sm font-medium">
          Contributions ({contributions.length})
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
          {sortedContributions.map((contribution) => (
            <div
              key={contribution.id}
              className="flex items-center justify-between p-2 rounded-md border bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {formatCurrency(Number(contribution.amount), currency)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDate(contribution.date)}
                  </span>
                </div>
                {contribution.notes && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {contribution.notes}
                  </p>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10 ml-2 shrink-0"
                    title="Delete contribution"
                    disabled={deletingContributionId === contribution.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Contribution</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this contribution of{" "}
                      {formatCurrency(Number(contribution.amount), currency)}?
                      This will remove it from the goal and update the progress.
                      <br />
                      <br />
                      <strong>This action cannot be undone.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex flex-row gap-2">
                    <AlertDialogCancel
                      disabled={deletingContributionId === contribution.id}
                      className="flex-1"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteContribution(contribution.id)}
                      disabled={deletingContributionId === contribution.id}
                      className="bg-red-600 hover:bg-red-700 flex-1"
                    >
                      {deletingContributionId === contribution.id
                        ? "Deleting..."
                        : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
