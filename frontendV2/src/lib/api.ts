
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Submission {
  id: string;
  title: string;
  content_type: string;
  status: 'pending' | 'uploaded' | 'preprocessing' | 'preprocessed' | 'analyzing' | 'analyzed' | 'completed' | 'failed';
  created_at: string;
  submitted_at: string;
  has_deep_analysis?: boolean;
}

export interface Rule {
  id: string;
  category: 'irdai' | 'brand' | 'seo';
  rule_text: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  keywords: string[];
  pattern: string | null;
  points_deduction: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface RuleStats {
  total_rules: number;
  active_rules: number;
  inactive_rules: number;
  by_category: {
    irdai: number;
    brand: number;
    seo: number;
  };
  by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface RuleGenerationResponse {
    success: boolean;
    rules_created: number;
    rules_failed: number;
    rules: Rule[];
    errors: string[];
}

export const api = {
  // Submissions
  uploadSubmission: (data: FormData) =>
    apiClient.post('/api/submissions/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getSubmissions: () => apiClient.get<Submission[]>('/api/submissions'),

  getSubmission: (id: string) =>
    apiClient.get<Submission>(`/api/submissions/${id}`),

  analyzeSubmission: (id: string) =>
    apiClient.post(`/api/submissions/${id}/analyze`),

  deleteSubmission: (id: string) =>
    apiClient.delete(`/api/submissions/${id}`),

  deleteAllSubmissions: () =>
    apiClient.delete('/api/submissions'),

  // Dashboard & Misc (Placeholders for future use)
  getDashboardStats: () => apiClient.get('/api/dashboard/stats'),
  getRecentSubmissions: () => apiClient.get('/api/dashboard/recent'),

  // Admin - Rule Management
  getRules: (params: {
    page?: number;
    page_size?: number;
    category?: string;
    severity?: string;
    is_active?: boolean;
    search?: string;
    userId?: string;
  }) => {
    return apiClient.get<{ rules: Rule[]; total: number; total_pages: number }>('/api/admin/rules', {
      params,
      headers: params.userId ? { 'X-User-Id': params.userId } : undefined,
    });
  },

  getRuleStats: (userId?: string) =>
    apiClient.get<RuleStats>('/api/admin/rules/stats/summary', {
      headers: userId ? { 'X-User-Id': userId } : undefined,
    }),

  updateRule: (ruleId: string, data: Partial<Rule>, userId?: string) =>
    apiClient.put(`/api/admin/rules/${ruleId}`, data, {
      headers: userId ? { 'X-User-Id': userId } : undefined,
    }),

  deleteRule: (ruleId: string, userId?: string) =>
    apiClient.delete(`/api/admin/rules/${ruleId}`, {
      headers: userId ? { 'X-User-Id': userId } : undefined,
    }),

  previewRulesFromDocument: (file: File, documentTitle: string, userId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_title', documentTitle);

    return apiClient.post('/api/admin/rules/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-User-Id': userId,
      },
    });
  },
  
  bulkSubmitRules: (data: any, userId?: string) =>
    apiClient.post('/api/admin/rules/bulk-submit', data, {
        headers: userId ? { 'X-User-Id': userId } : undefined,
    }),
};
