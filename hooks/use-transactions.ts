import {
  createTransaction as createTransactionAction,
  deleteTransaction as deleteTransactionAction,
  updateTransaction as updateTransactionAction,
} from "@/lib/actions/transaction-actions";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Hooks for mutations
export function useCreateTransaction() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      createTransactionAction(input),
    onSuccess: () => {
      router.refresh(); // Refresh server-side data
      toast.success("Transaction created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });
}

export function useUpdateTransaction() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTransactionInput;
    }) => updateTransactionAction(id, input),
    onSuccess: () => {
      router.refresh(); // Refresh server-side data
      toast.success("Transaction updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });
}

export function useDeleteTransaction() {
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteTransactionAction(id),
    onSuccess: () => {
      router.refresh(); // Refresh server-side data
      toast.success("Transaction deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete transaction");
    },
  });
}
