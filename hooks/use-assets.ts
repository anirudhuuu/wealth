import {
  createAsset as createAssetAction,
  deleteAsset as deleteAssetAction,
  updateAsset as updateAssetAction,
} from "@/lib/actions/asset-actions";
import type { CreateAssetInput, UpdateAssetInput } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Hooks for mutations
export function useCreateAsset() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateAssetInput) => createAssetAction(input),
    onSuccess: () => {
      router.refresh(); // Refresh server-side data
      toast.success("Asset created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create asset");
    },
  });
}

export function useUpdateAsset() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAssetInput }) =>
      updateAssetAction(id, input),
    onSuccess: () => {
      router.refresh(); // Refresh server-side data
      toast.success("Asset updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update asset");
    },
  });
}

export function useDeleteAsset() {
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteAssetAction(id),
    onSuccess: () => {
      router.refresh(); // Refresh server-side data
      toast.success("Asset deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete asset");
    },
  });
}
