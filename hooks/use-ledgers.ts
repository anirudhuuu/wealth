import { apiClient } from "@/lib/api-client";
import type {
  CreateLedgerInput,
  LedgerFilters,
  UpdateLedgerInput,
} from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Query keys
export const ledgerKeys = {
  all: ["ledgers"] as const,
  lists: () => [...ledgerKeys.all, "list"] as const,
  list: (filters?: LedgerFilters) => [...ledgerKeys.lists(), filters] as const,
  details: () => [...ledgerKeys.all, "detail"] as const,
  detail: (id: string) => [...ledgerKeys.details(), id] as const,
};

// Hooks for fetching ledgers
export function useLedgers(filters?: LedgerFilters) {
  return useQuery({
    queryKey: ledgerKeys.list(filters),
    queryFn: () => apiClient.getLedgers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLedger(id: string) {
  return useQuery({
    queryKey: ledgerKeys.detail(id),
    queryFn: () => apiClient.getLedger(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hooks for mutations
export function useCreateLedger() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateLedgerInput) => apiClient.createLedger(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ledgerKeys.lists() });
      router.refresh(); // Refresh server-side data
      toast.success("Ledger created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create ledger");
    },
  });
}

export function useUpdateLedger() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLedgerInput }) =>
      apiClient.updateLedger(id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ledgerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: ledgerKeys.detail(variables.id),
      });
      router.refresh(); // Refresh server-side data
      toast.success("Ledger updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ledger");
    },
  });
}

export function useDeleteLedger() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteLedger(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ledgerKeys.lists() });
      router.refresh(); // Refresh server-side data
      toast.success("Ledger deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete ledger");
    },
  });
}
