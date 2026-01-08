// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  tier?: "hobby" | "pro" | "enterprise";
}

export interface Guideline {
  id: string;
  project_id: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface Rule {
  id: string;
  rule_text: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  is_active: boolean;
  created_at: string;
  project_id?: string;
}

// Submission Types
export interface Submission {
  id: string;
  project_id?: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  status: "pending" | "processing" | "completed" | "failed";
  uploaded_at: string;
  analyzed_at?: string;
  user_id: string;
}

export interface Violation {
  id: string;
  submission_id: string;
  rule_id: string;
  rule_text: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location?: string;
  detected_at: string;
  current_text?: string;
  suggested_fix?: string;
  is_auto_fixable?: boolean;
}

export interface AnalysisResult {
  submission_id: string;
  total_violations: number;
  violations_by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  violations: Violation[];
  compliance_score: number;
  analyzed_at: string;
}

// Compliance Check Results (for analytics)
export interface ComplianceCheck {
  submission_id: string;
  check_date: string;
  status: "passed" | "flagged" | "failed" | "waiting_for_review";
  overall_score: number;
  irdai_score: number;
  brand_score: number;
  seo_score: number;
  grade: string;
  violations: Violation[];
  ai_summary: string;
  has_deep_analysis?: boolean;
}

// Dashboard Types
export interface DashboardStats {
  total_submissions: number;
  total_violations: number;
  avg_compliance_score: number;
  pending_submissions: number;
  flagged_count: number;
  pending_count: number;
}

export interface TrendData {
  date: string;
  submissions: number;
  violations: number;
  compliance_score: number;
}

export interface ViolationHeatmap {
  category: string;
  count: number;
  severity_breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface TopViolation {
  id: string;
  submission_id: string;
  rule_id: string;
  rule_text: string;
  description: string;
  count: number;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  location?: string;
  detected_at: string;
  current_text?: string;
  suggested_fix?: string;
  is_auto_fixable?: boolean;
}

// Dashboard Response Types
export interface TrendsResponse {
  scores: number[];
  dates: string[];
}

export interface HeatmapResponse {
  series: Array<{
    name: string;
    data: number[];
  }>;
  categories: string[];
}

// Onboarding Types
export interface OnboardingData {
  user_id: string;
  industry: string;
  brand_name: string;
  brand_guidelines?: string;
  analysis_scope: string[];
  region?: string;
}

export interface UserConfig {
  user_id: string;
  industry: string;
  brand_name: string;
  analysis_scope: string[];
  region?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
