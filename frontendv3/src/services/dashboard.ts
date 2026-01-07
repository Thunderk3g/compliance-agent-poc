import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DashboardStats, Submission, TopViolation, TrendData, ViolationHeatmap } from '../types';

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (projectId?: string) => [...dashboardKeys.all, 'stats', projectId] as const,
  trends: (days: number, projectId?: string) => [...dashboardKeys.all, 'trends', days, projectId] as const,
  heatmap: (projectId?: string) => [...dashboardKeys.all, 'heatmap', projectId] as const,
  topViolations: (limit: number, projectId?: string) => [...dashboardKeys.all, 'violations', limit, projectId] as const,
  recentSubmissions: (projectId?: string) => [...dashboardKeys.all, 'recent', projectId] as const,
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

export function useDashboardTrends(days: number = 30, projectId?: string) {
  return useQuery<TrendData[]>({
    queryKey: dashboardKeys.trends(days, projectId),
    queryFn: async () => {
      const response = await api.getDashboardTrends(days, projectId);
      return response.data as TrendData[];
    },
  });
}

export function useViolationsHeatmap(projectId?: string) {
  return useQuery<ViolationHeatmap[]>({
    queryKey: dashboardKeys.heatmap(projectId),
    queryFn: async () => {
      const response = await api.getViolationsHeatmap(projectId);
      return response.data as ViolationHeatmap[];
    },
  });
}

export function useTopViolations(limit: number = 5, projectId?: string) {
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
