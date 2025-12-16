import {
  addContribution as addContributionAction,
  createGoal as createGoalAction,
  deleteContribution as deleteContributionAction,
  deleteGoal as deleteGoalAction,
  getGoalContributions as getGoalContributionsAction,
  updateContribution as updateContributionAction,
  updateGoal as updateGoalAction,
} from "@/lib/actions/goal-actions";
import type {
  CreateGoalContributionInput,
  CreateGoalInput,
  UpdateGoalContributionInput,
  UpdateGoalInput,
} from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Hooks for goal mutations
export function useCreateGoal() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateGoalInput) => createGoalAction(input),
    onSuccess: () => {
      router.refresh();
      toast.success("Goal created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create goal");
    },
  });
}

export function useUpdateGoal() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) =>
      updateGoalAction(id, input),
    onSuccess: () => {
      router.refresh();
      toast.success("Goal updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update goal");
    },
  });
}

export function useDeleteGoal() {
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteGoalAction(id),
    onSuccess: () => {
      router.refresh();
      toast.success("Goal deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete goal");
    },
  });
}

// Hooks for contribution mutations
export function useAddContribution() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGoalContributionInput) =>
      addContributionAction(input),
    onSuccess: (_, variables) => {
      // Invalidate and refetch contributions for this goal
      queryClient.invalidateQueries({
        queryKey: ["goal-contributions", variables.goalId],
      });
      router.refresh();
      toast.success("Contribution added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add contribution");
    },
  });
}

export function useUpdateContribution() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      goalId,
      input,
    }: {
      id: string;
      goalId: string;
      input: UpdateGoalContributionInput;
    }) => updateContributionAction(id, goalId, input),
    onSuccess: (_, variables) => {
      // Invalidate and refetch contributions for this goal
      queryClient.invalidateQueries({
        queryKey: ["goal-contributions", variables.goalId],
      });
      router.refresh();
      toast.success("Contribution updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update contribution");
    },
  });
}

export function useDeleteContribution() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, goalId }: { id: string; goalId: string }) =>
      deleteContributionAction(id, goalId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch contributions for this goal
      queryClient.invalidateQueries({
        queryKey: ["goal-contributions", variables.goalId],
      });
      router.refresh();
      toast.success("Contribution deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete contribution");
    },
  });
}

// Hook for fetching contributions
export function useGoalContributions(goalId: string) {
  return useQuery({
    queryKey: ["goal-contributions", goalId],
    queryFn: () => getGoalContributionsAction(goalId),
    enabled: !!goalId,
  });
}
