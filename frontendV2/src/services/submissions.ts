import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface Submission {
  id: string;
  project_id: string;
  title: string;
  content_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  compliance_score?: number;
  submitted_at: string;
  analyzed_at?: string;
}

export interface SubmissionDetail extends Submission {
  violations?: Array<{
    rule_id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    category: string;
  }>;
  metadata?: Record<string, any>;
}

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
  return useQuery<SubmissionDetail>({
    queryKey: submissionKeys.detail(id),
    queryFn: async () => {
      const response = await api.getSubmission(id);
      return response.data as SubmissionDetail;
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
