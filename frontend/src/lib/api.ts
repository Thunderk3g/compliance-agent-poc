import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to inject User ID
apiClient.interceptors.request.use((config) => {
  let userId = localStorage.getItem("userId");
  if (!userId || userId === "demo-user-id") {
    // Generate or use default valid UUID for demo
    userId = "550e8400-e29b-41d4-a716-446655440000";
    localStorage.setItem("userId", userId);
  }
  console.log("[API] Injecting X-User-Id:", userId);
  config.headers["X-User-Id"] = userId;
  return config;
});

export const api = {
  // Submissions
  uploadSubmission: (data: FormData) =>
    apiClient.post("/api/submissions/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getSubmissions: (projectId?: string) =>
    apiClient.get("/api/submissions", { params: { project_id: projectId } }),

  getSubmission: (id: string) => apiClient.get(`/api/submissions/${id}`),

  getSubmissionById: (id: string) => apiClient.get(`/api/submissions/${id}`),

  analyzeSubmission: (id: string) =>
    apiClient.post(`/api/submissions/${id}/analyze`),

  deleteSubmission: (id: string) => apiClient.delete(`/api/submissions/${id}`),

  deleteAllSubmissions: () => apiClient.delete("/api/submissions"),

  // HITL
  resumeSubmission: (id: string, decision: string, feedback?: string) =>
    apiClient.post(`/api/submissions/${id}/resume`, {
      action: decision,
      feedback,
    }),

  // PDF Modification
  applyPdfFixes: (id: string) =>
    apiClient.post(`/api/submissions/${id}/apply-fixes`),

  downloadModifiedPdf: (id: string) =>
    apiClient.get(`/api/submissions/${id}/download-modified`, {
      responseType: "blob",
    }),

  // Compliance
  getComplianceResults: (submissionId: string) =>
    apiClient.get(`/api/compliance/${submissionId}`),

  getInterimResults: (submissionId: string) =>
    apiClient.get(`/api/compliance/${submissionId}/interim-results`),

  getViolations: (submissionId: string) =>
    apiClient.get(`/api/compliance/${submissionId}/violations`),

  // Dashboard
  getDashboardStats: () => apiClient.get("/api/dashboard/stats"),

  getRecentSubmissions: () => apiClient.get("/api/dashboard/recent"),

  getDashboardTrends: (days: number = 30) =>
    apiClient.get("/api/dashboard/trends", { params: { days } }),

  getViolationsHeatmap: () =>
    apiClient.get("/api/dashboard/violations-heatmap"),

  getTopViolations: (limit: number = 5) =>
    apiClient.get("/api/dashboard/top-violations", { params: { limit } }),

  // Phase 2: Admin - Rule Management
  generateRulesFromDocument: (
    file: File,
    documentTitle: string,
    userId: string
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_title", documentTitle);

    return apiClient.post("/api/admin/rules/generate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-User-Id": userId,
      },
    });
  },

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

  getRule: (ruleId: string, userId: string) =>
    apiClient.get(`/api/admin/rules/${ruleId}`, {
      headers: { "X-User-Id": userId },
    }),

  updateRule: (ruleId: string, data: any, userId: string) =>
    apiClient.put(`/api/admin/rules/${ruleId}`, data, {
      headers: { "X-User-Id": userId },
    }),

  deleteRule: (ruleId: string, userId: string) =>
    apiClient.delete(`/api/admin/rules/${ruleId}`, {
      headers: { "X-User-Id": userId },
    }),

  deleteAllRules: (userId: string) =>
    apiClient.delete("/api/admin/rules", {
      headers: { "X-User-Id": userId },
    }),

  createRule: (data: any, userId: string) =>
    apiClient.post("/api/admin/rules", data, {
      headers: { "X-User-Id": userId },
    }),

  getRuleStats: (userId: string) =>
    apiClient.get("/api/admin/rules/stats/summary", {
      headers: { "X-User-Id": userId },
    }),

  // Rule Preview Workflow (Phase 2 Enhancement)
  previewRulesFromDocument: (
    file: File,
    documentTitle: string,
    userId: string
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_title", documentTitle);

    return apiClient.post("/api/admin/rules/preview", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-User-Id": userId,
      },
    });
  },

  refineRule: (
    data: {
      rule_text: string;
      refinement_instruction: string;
      category: string;
      severity: string;
    },
    userId: string
  ) =>
    apiClient.post("/api/admin/rules/refine", data, {
      headers: { "X-User-Id": userId },
    }),

  bulkSubmitRules: (
    data: {
      document_title: string;
      approved_rules: any[];
    },
    userId: string
  ) =>
    apiClient.post("/api/admin/rules/bulk-submit", data, {
      headers: { "X-User-Id": userId },
    }),

  // Deep Compliance Research Mode
  triggerDeepAnalysis: (
    submissionId: string,
    severityWeights: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    }
  ) =>
    apiClient.post(`/api/compliance/${submissionId}/deep-analyze`, {
      severity_weights: severityWeights,
    }),

  getDeepAnalysisResults: (submissionId: string) =>
    apiClient.get(`/api/compliance/${submissionId}/deep-results`),

  getDeepAnalysisPresets: (submissionId: string) =>
    apiClient.get(`/api/compliance/${submissionId}/deep-analyze/presets`),

  downloadDeepAnalysisReport: (submissionId: string) =>
    apiClient.get(`/api/compliance/${submissionId}/deep-analysis/export`, {
      responseType: "blob",
    }),

  syncDeepAnalysisResults: (submissionId: string) =>
    apiClient.post(`/api/compliance/${submissionId}/deep-analysis/sync`),

  // Phase 3: Chunked Content Processing
  getPreprocessingStats: () =>
    apiClient.get("/api/dashboard/preprocessing-stats"),

  getSubmissionChunks: (submissionId: string) =>
    apiClient.get(`/api/preprocessing/${submissionId}/chunks`),

  getPreprocessingStatus: (submissionId: string) =>
    apiClient.get(`/api/preprocessing/${submissionId}/status`),

  triggerPreprocessing: (
    submissionId: string,
    params?: { chunk_size?: number; overlap?: number }
  ) => apiClient.post(`/api/preprocessing/${submissionId}`, params),

  // Adaptive Compliance Engine: Onboarding
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
  // Phase 1: Project System
  createProject: (data: { 
    name: string; 
    description: string;
    active_agents?: string[];
  }) =>
    apiClient.post("/api/projects/", data),

  getProjects: () => apiClient.get("/api/projects/"),

  getProject: (projectId: string) =>
    apiClient.get(`/api/projects/${projectId}`),

  updateProject: (projectId: string, data: {
    name?: string;
    description?: string;
    active_agents?: string[];
  }) => apiClient.put(`/api/projects/${projectId}`, data),

  // Multi-Agent Registry & Toggle
  getAgentRegistry: () => apiClient.get("/api/projects/agents/registry"),

  toggleProjectAgent: (projectId: string, agentType: string) =>
    apiClient.post(`/api/projects/${projectId}/agents/${agentType}/toggle`),

  deleteProject: (projectId: string) =>
    apiClient.delete(`/api/projects/${projectId}`),

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
      { instructions }
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

  // ============================================
  // Multi-Agent System APIs
  // ============================================

  // Voice Audit Agent
  analyzeVoiceCall: (data: {
    call_id?: string;
    transcript?: Array<{ timestamp: number; speaker: string; text: string }>;
    audio_url?: string;
  }) => apiClient.post("/voice/analyze", data),

  uploadAudioFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/voice/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getVoiceJobStatus: (jobId: string) =>
    apiClient.get(`/voice/status/${jobId}`),

  getVoiceViolationTypes: () => apiClient.get("/voice/violations/types"),

  // Analytics / BI Agent
  getAnalyticsInsights: (query: string, projectId?: string) =>
    apiClient.post("/analytics/insights", {
      query,
      project_id: projectId,
    }),

  getAnalyticsTrends: (period: string = "month", projectId?: string) =>
    apiClient.get("/analytics/trends", {
      params: { period, project_id: projectId },
    }),

  getViolationHeatmap: (projectId?: string) =>
    apiClient.get("/analytics/heatmap", {
      params: { project_id: projectId },
    }),

  getAgentPerformance: () => apiClient.get("/analytics/performance"),

  getExecutiveSummary: () => apiClient.get("/analytics/summary"),

  // Sales Chat Agent
  sendChatMessage: (message: string, sessionId?: string) =>
    apiClient.post("/chat/message", {
      message,
      session_id: sessionId,
    }),

  getChatHistory: (sessionId: string) =>
    apiClient.get(`/chat/history/${sessionId}`),

  getCustomerProfile: (sessionId: string) =>
    apiClient.get(`/chat/profile/${sessionId}`),

  calculateRiskAssessment: (data: {
    age: number;
    smoker?: boolean;
    occupation?: string;
    pre_existing?: string[];
  }) =>
    apiClient.post("/chat/risk-assessment", null, {
      params: data,
    }),

  // Voice Reports
  getVoiceReportsByProject: (projectId: string) =>
    apiClient.get(`/voice-reports/project/${projectId}`),

  getVoiceReport: (reportId: string) =>
    apiClient.get(`/voice-reports/${reportId}`),

  // Analytics Reports
  getAnalyticsReportsByProject: (projectId: string) =>
    apiClient.get(`/analytics-reports/project/${projectId}`),

  getAnalyticsReport: (reportId: string) =>
    apiClient.get(`/analytics-reports/${reportId}`),

  analyzeVoice: (projectId: string) =>
    apiClient.post(`/voice-reports/${projectId}/analyze`),

  analyzeAnalytics: (projectId: string) =>
    apiClient.post(`/analytics-reports/${projectId}/analyze`),

  chatAnalytics: (projectId: string, query: string, datasetId?: string, context?: any) =>
      apiClient.post('/analytics-reports/chat', { project_id: projectId, query, dataset_id: datasetId, context }),

  uploadDataset: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post('/analytics-reports/upload-dataset', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
