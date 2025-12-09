
import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Keys
export const submissionKeys = {
  all: ['submissions'] as const,
  lists: () => [...submissionKeys.all, 'list'] as const,
  detail: (id: string) => [...submissionKeys.all, 'detail', id] as const,
};

// Hooks
export function useSubmissions() {
  return useQuery({
    queryKey: submissionKeys.lists(),
    queryFn: async () => {
      const { data } = await api.getSubmissions();
      return data;
    },
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: submissionKeys.detail(id),
    queryFn: async () => {
        const { data } = await api.getSubmission(id);
        return data;
    },
    enabled: !!id,
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.lists() });
    },
  });
}

export function useDeleteAllSubmissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.deleteAllSubmissions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.lists() });
    },
  });
}

export function useAnalyzeSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.analyzeSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.lists() });
    },
  });
}
