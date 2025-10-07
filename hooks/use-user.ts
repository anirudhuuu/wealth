import { apiClient } from "@/lib/api-client";
import type { UpdateProfileInput } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Query keys
export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
};

// Hooks for fetching user data
export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => apiClient.getProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hooks for mutations
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => apiClient.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      router.refresh(); // Refresh server-side data
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}
