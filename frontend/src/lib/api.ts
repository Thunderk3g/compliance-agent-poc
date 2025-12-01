import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Submissions
  uploadSubmission: (data: FormData) =>
    apiClient.post('/api/submissions/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getSubmissions: () => apiClient.get('/api/submissions'),

  getSubmission: (id: string) =>
    apiClient.get(`/api/submissions/${id}`),

  getSubmissionById: (id: string) =>
    apiClient.get(`/api/submissions/${id}`),

  analyzeSubmission: (id: string) =>
    apiClient.post(`/api/submissions/${id}/analyze`),

  // PDF Modification
  applyPdfFixes: (id: string) =>
    apiClient.post(`/api/submissions/${id}/apply-fixes`),

  downloadModifiedPdf: (id: string) =>
    apiClient.get(`/api/submissions/${id}/download-modified`, {
      responseType: 'blob'
    }),

  // Compliance
  getComplianceResults: (submissionId: string) =>
    apiClient.get(`/api/compliance/${submissionId}`),

  getViolations: (submissionId: string) =>
    apiClient.get(`/api/compliance/${submissionId}/violations`),

  // Dashboard
  getDashboardStats: () => apiClient.get('/api/dashboard/stats'),

  getRecentSubmissions: () => apiClient.get('/api/dashboard/recent'),
};
