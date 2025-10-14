import { apiClient } from "@/lib/api-client";
import type {
  AssetFilters,
  CreateAssetInput,
  UpdateAssetInput,
} from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Query keys
export const assetKeys = {
  all: ["assets"] as const,
  lists: () => [...assetKeys.all, "list"] as const,
  list: (filters?: AssetFilters) => [...assetKeys.lists(), filters] as const,
  details: () => [...assetKeys.all, "detail"] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
};

// Hooks for fetching assets
export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: () => apiClient.getAssets(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn: () => apiClient.getAsset(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hooks for mutations
export function useCreateAsset() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateAssetInput) => apiClient.createAsset(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      router.refresh(); // Refresh server-side data
      toast.success("Asset created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create asset");
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAssetInput }) =>
      apiClient.updateAsset(id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: assetKeys.detail(variables.id),
      });
      router.refresh(); // Refresh server-side data
      toast.success("Asset updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update asset");
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      router.refresh(); // Refresh server-side data
      toast.success("Asset deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete asset");
    },
  });
}
