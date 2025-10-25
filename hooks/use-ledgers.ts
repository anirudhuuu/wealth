import {
  createLedger as createLedgerAction,
  deleteLedger as deleteLedgerAction,
  updateLedger as updateLedgerAction,
} from "@/lib/actions/ledger-actions";
import type { CreateLedgerInput, UpdateLedgerInput } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Hooks for mutations
export function useCreateLedger() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateLedgerInput) => createLedgerAction(input),
    onSuccess: () => {
      router.refresh(); // Refresh server-side data
      toast.success("Ledger created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create ledger");
    },
  });
}

export function useUpdateLedger() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLedgerInput }) =>
      updateLedgerAction(id, input),
    onSuccess: () => {
      router.refresh(); // Refresh server-side data
      toast.success("Ledger updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ledger");
    },
  });
}

export function useDeleteLedger() {
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteLedgerAction(id),
    onSuccess: () => {
      router.refresh(); // Refresh server-side data
      toast.success("Ledger deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete ledger");
    },
  });
}
