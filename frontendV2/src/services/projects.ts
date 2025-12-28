import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string;
}

export interface Guideline {
  id: string;
  project_id: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
}

// Query Keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: any) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  guidelines: (id: string) => [...projectKeys.detail(id), 'guidelines'] as const,
};

// Custom Hooks
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      const response = await api.getProjects();
      return response.data as Project[];
    },
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const response = await api.getProject(id);
      return response.data as Project;
    },
    enabled: !!id,
  });
}

export function useProjectGuidelines(projectId: string) {
  return useQuery<Guideline[]>({
    queryKey: projectKeys.guidelines(projectId),
    queryFn: async () => {
      const response = await api.getProjectGuidelines(projectId);
      return response.data as Guideline[];
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description: string }) => 
      api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUploadGuideline(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => api.uploadGuideline(projectId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.guidelines(projectId) });
    },
  });
}

export function useDeleteGuideline(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guidelineId: string) => 
      api.deleteGuideline(projectId, guidelineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.guidelines(projectId) });
    },
  });
}
