export interface DashboardStats {
  total_submissions: number;
  avg_compliance_score: number;
  pending_count: number;
  flagged_count: number;
}

export interface ComplianceTrend {
  dates: string[];
  scores: number[];
  counts: number[];
}

export interface ViolationsHeatmap {
  series: { name: string; data: number[] }[];
  categories: string[];
}

export interface TopViolation {
  description: string;
  count: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

export interface RecentSubmission {
  id: string;
  title: string;
  status: 'passed' | 'flagged' | 'failed';
  score: number;
  submitted_at: string;
}

export interface CategoryScore {
  irdai: number;
  brand: number;
  seo: number;
}
