import { apiClient } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import type { UpdateProfileInput } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  current: () => [...userKeys.all, "current"] as const,
};

// Hook for fetching current user
export function useUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: async (): Promise<User | null> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching user profile
export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => apiClient.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for updating user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => apiClient.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

// Combined hook for user and profile data
export function useUserWithProfile() {
  const userQuery = useUser();
  const profileQuery = useProfile();

  return {
    user: userQuery.data,
    profile: profileQuery.data,
    isLoading: userQuery.isLoading || profileQuery.isLoading,
    error: userQuery.error || profileQuery.error,
    isAdmin: profileQuery.data?.is_admin ?? false,
  };
}
