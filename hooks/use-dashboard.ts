import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  kpis: () => [...dashboardKeys.all, "kpis"] as const,
};

// Hook for fetching dashboard KPIs
export function useDashboardKPIs() {
  return useQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: () => apiClient.getDashboardKPIs(),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for dashboard)
  });
}
