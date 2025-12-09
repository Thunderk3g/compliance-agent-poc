
import { api, type Rule } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const SUPER_ADMIN_USER_ID = '11111111-1111-1111-1111-111111111111';

export const ruleKeys = {
  all: ['rules'] as const,
  lists: () => [...ruleKeys.all, 'list'] as const,
  list: (filters: any) => [...ruleKeys.lists(), filters] as const,
  stats: () => [...ruleKeys.all, 'stats'] as const,
};

export function useRules(filters: { 
    page?: number; 
    category?: string; 
    severity?: string; 
    is_active?: boolean; 
    search?: string; 
    page_size?: number;
}) {
  return useQuery({
    queryKey: ruleKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.getRules({ ...filters, userId: SUPER_ADMIN_USER_ID });
      return data;
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new pages
  });
}

export function useRuleStats() {
  return useQuery({
    queryKey: ruleKeys.stats(),
    queryFn: async () => {
      const { data } = await api.getRuleStats(SUPER_ADMIN_USER_ID);
      return data;
    },
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Rule> }) => 
        api.updateRule(id, updates, SUPER_ADMIN_USER_ID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteRule(id, SUPER_ADMIN_USER_ID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
}

// Complex mutations like bulk submit will be handled directly in the component for now
// to handle the multi-step preview flow easier, or we could add them here if needed.
