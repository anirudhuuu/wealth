import { apiClient } from "@/lib/api-client";
import type {
  CreateTransactionInput,
  TransactionFilters,
  UpdateTransactionInput,
} from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Query keys
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters?: TransactionFilters) =>
    [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  summary: (filters?: TransactionFilters) =>
    [...transactionKeys.all, "summary", filters] as const,
};

// Hooks for fetching transactions
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => apiClient.getTransactions(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes - transactions don't change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => apiClient.getTransaction(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTransactionSummary(filters?: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.summary(filters),
    queryFn: () => apiClient.getTransactionSummary(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hooks for mutations
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      apiClient.createTransaction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      router.refresh(); // Refresh server-side data
      toast.success("Transaction created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTransactionInput;
    }) => apiClient.updateTransaction(id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      router.refresh(); // Refresh server-side data
      toast.success("Transaction updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      router.refresh(); // Refresh server-side data
      toast.success("Transaction deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete transaction");
    },
  });
}
