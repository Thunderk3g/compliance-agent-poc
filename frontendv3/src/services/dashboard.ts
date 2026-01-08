import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  DashboardStats,
  HeatmapResponse,
  Submission,
  TopViolation,
  TrendsResponse,
} from "../types";

// Query Keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (projectId?: string) =>
    [...dashboardKeys.all, "stats", projectId] as const,
  trends: (days: number, projectId?: string) =>
    [...dashboardKeys.all, "trends", days, projectId] as const,
  heatmap: (projectId?: string) =>
    [...dashboardKeys.all, "heatmap", projectId] as const,
  topViolations: (limit: number, projectId?: string) =>
    [...dashboardKeys.all, "violations", limit, projectId] as const,
  recentSubmissions: (projectId?: string) =>
    [...dashboardKeys.all, "recent", projectId] as const,
};

// Custom Hooks
export function useDashboardStats(projectId?: string) {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(projectId),
    queryFn: async () => {
      const response = await api.getDashboardStats(projectId);
      return response.data as DashboardStats;
    },
  });
}

export function useDashboardTrends(projectId: string, days: number = 30) {
  return useQuery<TrendsResponse>({
    queryKey: dashboardKeys.trends(days, projectId),
    queryFn: async () => {
      const response = await api.getDashboardTrends(days, projectId);
      return response.data as TrendsResponse;
    },
  });
}

export function useViolationsHeatmap(projectId: string) {
  return useQuery<HeatmapResponse>({
    queryKey: dashboardKeys.heatmap(projectId),
    queryFn: async () => {
      const response = await api.getViolationsHeatmap(projectId);
      return response.data as HeatmapResponse;
    },
  });
}

export function useDashboardTopViolations(
  projectId: string,
  limit: number = 5
) {
  return useQuery<TopViolation[]>({
    queryKey: dashboardKeys.topViolations(limit, projectId),
    queryFn: async () => {
      const response = await api.getTopViolations(limit, projectId);
      return response.data as TopViolation[];
    },
  });
}

export function useRecentSubmissions(projectId?: string) {
  return useQuery<Submission[]>({
    queryKey: dashboardKeys.recentSubmissions(projectId),
    queryFn: async () => {
      const response = await api.getRecentSubmissions(projectId);
      return response.data as Submission[];
    },
  });
}
