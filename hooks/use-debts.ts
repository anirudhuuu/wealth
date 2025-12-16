import {
  addPayment as addPaymentAction,
  createDebt as createDebtAction,
  deleteDebt as deleteDebtAction,
  deletePayment as deletePaymentAction,
  getDebtPayments as getDebtPaymentsAction,
  getDebts as getDebtsAction,
  markScheduleAsMissed as markScheduleAsMissedAction,
  markScheduleAsPaid as markScheduleAsPaidAction,
  skipSchedule as skipScheduleAction,
  updateDebt as updateDebtAction,
  updatePayment as updatePaymentAction,
} from "@/lib/actions/debt-actions";
import type {
  CreateDebtInput,
  CreateDebtPaymentInput,
  DebtFilters,
  UpdateDebtInput,
  UpdateDebtPaymentInput,
} from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Hooks for debt mutations
export function useCreateDebt() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDebtInput) => createDebtAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.refresh();
      toast.success("Debt created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create debt");
    },
  });
}

export function useUpdateDebt() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDebtInput }) =>
      updateDebtAction(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({
        queryKey: ["debt", variables.id],
      });
      router.refresh();
      toast.success("Debt updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update debt");
    },
  });
}

export function useDeleteDebt() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDebtAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.refresh();
      toast.success("Debt deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete debt");
    },
  });
}

// Hooks for payment mutations
export function useAddPayment() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDebtPaymentInput) => addPaymentAction(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["debt-payments", variables.debtId],
      });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.refresh();
      toast.success("Payment recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record payment");
    },
  });
}

export function useUpdatePayment() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      debtId,
      input,
    }: {
      id: string;
      debtId: string;
      input: UpdateDebtPaymentInput;
    }) => updatePaymentAction(id, debtId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["debt-payments", variables.debtId],
      });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.refresh();
      toast.success("Payment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payment");
    },
  });
}

export function useDeletePayment() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, debtId }: { id: string; debtId: string }) =>
      deletePaymentAction(id, debtId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["debt-payments", variables.debtId],
      });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.refresh();
      toast.success("Payment deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete payment");
    },
  });
}

// Hooks for schedule mutations
export function useMarkScheduleAsPaid() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scheduleId,
      paymentId,
    }: {
      scheduleId: string;
      paymentId: string;
    }) => markScheduleAsPaidAction(scheduleId, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debt-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.refresh();
      toast.success("Schedule marked as paid");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark schedule as paid");
    },
  });
}

export function useMarkScheduleAsMissed() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => markScheduleAsMissedAction(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debt-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.refresh();
      toast.success("Schedule marked as missed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark schedule as missed");
    },
  });
}

export function useSkipSchedule() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => skipScheduleAction(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debt-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.refresh();
      toast.success("Schedule skipped");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to skip schedule");
    },
  });
}

// Hooks for fetching
export function useDebts(filters?: DebtFilters) {
  return useQuery({
    queryKey: ["debts", filters],
    queryFn: () => getDebtsAction(filters),
  });
}

export function useDebtPayments(debtId: string) {
  return useQuery({
    queryKey: ["debt-payments", debtId],
    queryFn: () => getDebtPaymentsAction(debtId),
    enabled: !!debtId,
  });
}
