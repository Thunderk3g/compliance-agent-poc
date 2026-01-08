/**
 * Dashboard Data Adapter
 * Transforms dashboard API data into ComplianceCheck format for analytics components
 */

import { ComplianceCheck, DashboardStats, Violation } from "../types";

export interface DashboardData {
  stats: DashboardStats;
  violations: Violation[];
}

/**
 * Transform dashboard data to ComplianceCheck format
 * This allows us to reuse the analytics components from Results page
 */
export function transformDashboardToComplianceCheck(
  data: DashboardData,
  projectId: string
): ComplianceCheck {
  const { stats, violations } = data;

  // Calculate category scores based on violations
  const irdaiViolations = violations.filter((v) => v.category === "irdai");
  const brandViolations = violations.filter((v) => v.category === "brand");
  const seoViolations = violations.filter((v) => v.category === "seo");

  // Simple scoring: 100 - (violations * weight)
  // This is a placeholder - adjust based on actual scoring logic
  const irdaiScore = Math.max(0, 100 - irdaiViolations.length * 5);
  const brandScore = Math.max(0, 100 - brandViolations.length * 5);
  const seoScore = Math.max(0, 100 - seoViolations.length * 5);

  // Overall score from stats or calculated
  const overallScore =
    stats.avg_compliance_score ||
    irdaiScore * 0.5 + brandScore * 0.3 + seoScore * 0.2;

  // Calculate grade
  const grade =
    overallScore >= 90
      ? "A"
      : overallScore >= 80
      ? "B"
      : overallScore >= 70
      ? "C"
      : overallScore >= 60
      ? "D"
      : "F";

  // Determine status
  const status =
    overallScore >= 80
      ? "passed"
      : stats.flagged_count > 0
      ? "flagged"
      : "failed";

  return {
    submission_id: projectId,
    check_date: new Date().toISOString(),
    status: status as "passed" | "flagged" | "failed",
    overall_score: overallScore,
    irdai_score: irdaiScore,
    brand_score: brandScore,
    seo_score: seoScore,
    grade,
    violations,
    ai_summary: `Project dashboard showing ${violations.length} total violations across all submissions.`,
    has_deep_analysis: false,
  };
}
