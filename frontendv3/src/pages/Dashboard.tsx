import {
  useDashboardStats,
  useDashboardTopViolations,
} from "@/services/dashboard";
import { AlertTriangle, Clock, FileText, Flag } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ScoreSidebar } from "../components/dashboard/ScoreSidebar";
import AutoFixabilityAnalysis from "../components/results/analytics/AutoFixabilityAnalysis";
import ScoreComparisonRadar from "../components/results/analytics/ScoreComparisonRadar";
import SeverityHeatmap from "../components/results/analytics/SeverityHeatmap";
import ViolationDistributionCharts from "../components/results/analytics/ViolationDistributionCharts";
import { transformDashboardToComplianceCheck } from "../lib/dashboardAdapter";

export default function Dashboard() {
  const { id: projectId } = useParams<{ id: string }>();

  if (!projectId) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">
          <p>No project selected</p>
        </div>
      </div>
    );
  }

  const { data: stats, isLoading: statsLoading } = useDashboardStats(projectId);
  const { data: violations = [], isLoading: violationsLoading } =
    useDashboardTopViolations(projectId, 100);

  const loading = statsLoading || violationsLoading;

  // Transform data for analytics components
  const complianceData = useMemo(() => {
    if (!stats) return null;
    return transformDashboardToComplianceCheck(
      { stats, violations },
      projectId
    );
  }, [stats, violations, projectId]);

  // Update sidebar with scores when data loads
  useEffect(() => {
    if (complianceData) {
      const sidebar = document.querySelector("aside");
      if (sidebar) {
        const sidebarContent = sidebar.querySelector(".p-6");
        if (sidebarContent) {
          // Create a container for React component
          const container = document.createElement("div");
          container.id = "score-sidebar-root";
          sidebarContent.innerHTML = "";
          sidebarContent.appendChild(container);

          // Render ScoreSidebar using React
          import("react-dom/client").then(({ createRoot }) => {
            const root = createRoot(container);
            root.render(
              <ScoreSidebar
                overallScore={complianceData.overall_score}
                irdaiScore={complianceData.irdai_score}
                brandScore={complianceData.brand_score}
                seoScore={complianceData.seo_score}
                grade={complianceData.grade}
              />
            );
          });
        }
      }
    }
  }, [complianceData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!complianceData) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Project Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive compliance analytics and insights
        </p>
      </div>

      {/* Analytics Grid - Varied Sizes */}
      <div className="grid grid-cols-12 gap-6">
        {/* Large: Score Comparison Radar - Takes 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <ScoreComparisonRadar results={complianceData} height={450} />
        </div>

        {/* Quick Stats - 2x2 Grid */}
        <div className="col-span-12 lg:col-span-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Total Submissions - Neutral Gray */}
            <div className="bg-background border border-border rounded-lg p-4 hover:shadow-sm transition-all">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {stats?.total_submissions || 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Total Submissions
                  </div>
                </div>
              </div>
            </div>

            {/* Total Violations - Subtle Red */}
            <div className="bg-background border border-red-100 rounded-lg p-4 hover:shadow-sm transition-all">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {complianceData.violations.length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Total Violations
                  </div>
                </div>
              </div>
            </div>

            {/* Flagged - Subtle Orange */}
            <div className="bg-background border border-orange-100 rounded-lg p-4 hover:shadow-sm transition-all">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <Flag className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {stats?.flagged_count || 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Flagged
                  </div>
                </div>
              </div>
            </div>

            {/* Pending - Subtle Cyan */}
            <div className="bg-background border border-cyan-100 rounded-lg p-4 hover:shadow-sm transition-all">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {stats?.pending_count || 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Pending Review
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medium: Violation Distribution - Takes 6 columns */}
        <div className="col-span-12 lg:col-span-6">
          <ViolationDistributionCharts
            violations={complianceData.violations}
            height={350}
          />
        </div>

        {/* Medium: Auto-Fixability - Takes 6 columns */}
        <div className="col-span-12 lg:col-span-6">
          <AutoFixabilityAnalysis
            violations={complianceData.violations}
            height={350}
          />
        </div>

        {/* Full Width: Severity Heatmap */}
        <div className="col-span-12">
          <SeverityHeatmap
            violations={complianceData.violations}
            height={350}
          />
        </div>
      </div>
    </div>
  );
}
