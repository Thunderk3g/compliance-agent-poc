import { api } from '@/lib/api';
import type {
  ComplianceTrend,
  DashboardStats,
  RecentSubmission,
  TopViolation,
  ViolationsHeatmap,
} from '@/types/dashboard';
import { useQuery } from '@tanstack/react-query';

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  trends: (days: number) => [...dashboardKeys.all, 'trends', days] as const,
  heatmap: () => [...dashboardKeys.all, 'heatmap'] as const,
  topViolations: (limit: number) => [...dashboardKeys.all, 'violations', limit] as const,
  recentSubmissions: () => [...dashboardKeys.all, 'recent'] as const,
};

// Custom Hooks
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const response = await api.getDashboardStats();
      return response.data as DashboardStats;
    },
  });
}

export function useDashboardTrends(days: number = 30) {
  return useQuery<ComplianceTrend>({
    queryKey: dashboardKeys.trends(days),
    queryFn: async () => {
      const response = await api.getDashboardTrends(days);
      return response.data as ComplianceTrend;
    },
  });
}

export function useViolationsHeatmap() {
  return useQuery<ViolationsHeatmap>({
    queryKey: dashboardKeys.heatmap(),
    queryFn: async () => {
      const response = await api.getViolationsHeatmap();
      return response.data as ViolationsHeatmap;
    },
  });
}

export function useTopViolations(limit: number = 5) {
  return useQuery<TopViolation[]>({
    queryKey: dashboardKeys.topViolations(limit),
    queryFn: async () => {
      const response = await api.getTopViolations(limit);
      return response.data as TopViolation[];
    },
  });
}

export function useRecentSubmissions() {
  return useQuery<RecentSubmission[]>({
    queryKey: dashboardKeys.recentSubmissions(),
    queryFn: async () => {
      const response = await api.getRecentSubmissions();
      return response.data as RecentSubmission[];
    },
  });
}
