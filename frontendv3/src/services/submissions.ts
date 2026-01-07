import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { AnalysisResult, Submission } from '../types';

// Query Keys
export const submissionKeys = {
  all: ['submissions'] as const,
  lists: () => [...submissionKeys.all, 'list'] as const,
  list: (projectId?: string) => [...submissionKeys.lists(), { projectId }] as const,
  details: () => [...submissionKeys.all, 'detail'] as const,
  detail: (id: string) => [...submissionKeys.details(), id] as const,
};

// Custom Hooks
export function useSubmissions(projectId?: string) {
  return useQuery<Submission[]>({
    queryKey: submissionKeys.list(projectId),
    queryFn: async () => {
      const response = await api.getSubmissions(projectId);
      return response.data as Submission[];
    },
  });
}

export function useSubmission(id: string) {
  return useQuery<AnalysisResult>({
    queryKey: submissionKeys.detail(id),
    queryFn: async () => {
      const response = await api.getSubmission(id);
      return response.data as AnalysisResult;
    },
    enabled: !!id,
  });
}

export function useUploadSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => api.uploadSubmission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.lists() });
    },
  });
}

export function useAnalyzeSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.analyzeSubmission(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(id) });
    },
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
