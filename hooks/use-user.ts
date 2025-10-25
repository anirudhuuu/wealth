import { updateProfile as updateProfileAction } from "@/lib/actions/user-actions";
import type { UpdateProfileInput } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Hook for updating user profile
export function useUpdateProfile() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfileAction(input),
    onSuccess: () => {
      router.refresh(); // Refresh server-side data
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}
