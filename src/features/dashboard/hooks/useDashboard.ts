import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: ["admin", "dashboard", "charts"],
    queryFn: () => dashboardService.getChartsData(),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
