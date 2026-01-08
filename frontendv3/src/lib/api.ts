import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to inject User ID
apiClient.interceptors.request.use((config) => {
  let userId = localStorage.getItem("userId");
  if (!userId || userId === "demo-user-id") {
    // Generate or use default valid UUID for demo
    userId = "550e8400-e29b-41d4-a716-446655440000";
    localStorage.setItem("userId", userId);
  }
  config.headers["X-User-Id"] = userId;
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error("Unauthorized access");
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Onboarding
  startOnboarding: (data: {
    user_id: string;
    industry: string;
    brand_name: string;
    brand_guidelines?: string;
    analysis_scope: string[];
    region?: string;
  }) => apiClient.post("/api/onboarding/start", data),

  getUserConfig: (userId: string) =>
    apiClient.get(`/api/onboarding/${userId}/config`),

  updateUserConfig: (
    userId: string,
    updates: {
      industry?: string;
      brand_name?: string;
      analysis_scope?: string[];
    }
  ) => {
    const params = new URLSearchParams();
    if (updates.industry) params.append("industry", updates.industry);
    if (updates.brand_name) params.append("brand_name", updates.brand_name);
    if (updates.analysis_scope) {
      updates.analysis_scope.forEach((scope) =>
        params.append("analysis_scope", scope)
      );
    }
    return apiClient.put(`/api/onboarding/${userId}/config?${params}`);
  },

  // Projects
  createProject: (data: { name: string; description: string }) =>
    apiClient.post("/api/projects/", data),

  getProjects: () => apiClient.get("/api/projects/"),

  getProject: (projectId: string) =>
    apiClient.get(`/api/projects/${projectId}`),

  uploadGuideline: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/api/projects/${projectId}/guidelines`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteGuideline: (projectId: string, guidelineId: string) =>
    apiClient.delete(`/api/projects/${projectId}/guidelines/${guidelineId}`),

  improveRules: (
    projectId: string,
    guidelineId: string,
    instructions: string
  ) =>
    apiClient.post(
      `/api/projects/${projectId}/guidelines/${guidelineId}/improve-rules`,
      {
        instructions,
      }
    ),

  refineProjectRule: (
    projectId: string,
    ruleId: string,
    instructions: string
  ) =>
    apiClient.post(`/api/projects/${projectId}/rules/${ruleId}/refine`, {
      instructions,
    }),

  deleteProjectRule: (projectId: string, ruleId: string) =>
    apiClient.delete(`/api/projects/${projectId}/rules/${ruleId}`),

  getProjectGuidelines: (projectId: string) =>
    apiClient.get(`/api/projects/${projectId}/guidelines`),

  // Rules
  getRules: (params: {
    page?: number;
    page_size?: number;
    category?: string;
    severity?: string;
    is_active?: boolean;
    search?: string;
    userId: string;
  }) => {
    const { userId, ...queryParams } = params;
    return apiClient.get("/api/admin/rules", {
      params: queryParams,
      headers: { "X-User-Id": userId },
    });
  },

  // Submissions
  uploadSubmission: (data: FormData) =>
    apiClient.post("/api/submissions/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getSubmissions: (projectId?: string) =>
    apiClient.get("/api/submissions", { params: { project_id: projectId } }),

  getSubmission: (id: string) => apiClient.get(`/api/submissions/${id}`),

  analyzeSubmission: (id: string) =>
    apiClient.post(`/api/submissions/${id}/analyze`),

  deleteSubmission: (id: string) => apiClient.delete(`/api/submissions/${id}`),

  // Dashboard
  getDashboardStats: (projectId?: string) =>
    apiClient.get("/api/dashboard/stats", {
      params: { project_id: projectId },
    }),

  getDashboardTrends: (days: number = 30, projectId?: string) =>
    apiClient.get("/api/dashboard/trends", {
      params: { days, project_id: projectId },
    }),

  getViolationsHeatmap: (projectId?: string) =>
    apiClient.get("/api/dashboard/violations-heatmap", {
      params: { project_id: projectId },
    }),

  getTopViolations: (limit: number = 5, projectId?: string) =>
    apiClient.get("/api/dashboard/top-violations", {
      params: { limit, project_id: projectId },
    }),

  getRecentSubmissions: (projectId?: string) =>
    apiClient.get("/api/dashboard/recent", {
      params: { project_id: projectId },
    }),

  triggerPreprocessing: (id: string) =>
    apiClient.post(`/api/submissions/${id}/preprocess`),
};
