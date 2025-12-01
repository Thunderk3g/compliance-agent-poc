export interface Submission {
  id: string;
  title: string;
  content_type: 'html' | 'markdown' | 'pdf' | 'docx';
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  submitted_at: string;
  submitted_by?: string;
}

export interface ComplianceCheck {
  id: string;
  submission_id: string;
  overall_score: number;
  irdai_score: number;
  brand_score: number;
  seo_score: number;
  status: 'passed' | 'flagged' | 'failed';
  grade: string;
  ai_summary: string;
  check_date: string;
  violations: Violation[];
}

export interface Violation {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'irdai' | 'brand' | 'seo';
  description: string;
  location: string;
  current_text: string;
  suggested_fix: string;
  is_auto_fixable: boolean;
}

export interface DashboardStats {
  total_submissions: number;
  avg_compliance_score: number;
  pending_count: number;
  flagged_count: number;
}
