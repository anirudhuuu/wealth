import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  kpis: (timeRange?: string, limit?: number, offset?: number) =>
    [...dashboardKeys.all, "kpis", { timeRange, limit, offset }] as const,
};

// Hook for fetching dashboard KPIs with pagination
export function useDashboardKPIs(
  timeRange: string = "12m",
  limit: number = 50,
  offset: number = 0
) {
  return useQuery({
    queryKey: dashboardKeys.kpis(timeRange, limit, offset),
    queryFn: () => apiClient.getDashboardKPIs(timeRange, limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data doesn't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch on window focus for dashboard
  });
}
