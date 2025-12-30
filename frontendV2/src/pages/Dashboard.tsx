import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { CategoryRadar } from '@/components/dashboard/CategoryRadar';
import { ComplianceTrendChart } from '@/components/dashboard/ComplianceTrendChart';
import { KPICard } from '@/components/dashboard/KPICard';
import { StatusDonut } from '@/components/dashboard/StatusDonut';
import { TopViolationsChart } from '@/components/dashboard/TopViolationsChart';
import { ViolationsHeatmap } from '@/components/dashboard/ViolationsHeatmap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  useDashboardStats,
  useDashboardTrends,
  useRecentSubmissions,
  useTopViolations,
  useViolationsHeatmap,
} from '@/services/dashboard';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, Clock, FileText, TrendingUp, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function Dashboard() {
  // Get project ID from URL params if in project context
  const { id: projectId } = useParams<{ id?: string }>();

  // Fetch dashboard data using custom hooks (with optional projectId)
  const { data: stats, isLoading: statsLoading } = useDashboardStats(projectId);
  const { data: trends, isLoading: trendsLoading } = useDashboardTrends(30, projectId);
  const { data: heatmap, isLoading: heatmapLoading } = useViolationsHeatmap(projectId);
  const { data: topViolations, isLoading: violationsLoading } = useTopViolations(5, projectId);
  const { data: recentSubmissions, isLoading: recentLoading } = useRecentSubmissions(projectId);

  const isLoading = statsLoading || trendsLoading || heatmapLoading || violationsLoading || recentLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if there's no data
  const hasData = stats && (stats.total_submissions > 0 || (topViolations && topViolations.length > 0) || (recentSubmissions && recentSubmissions.length > 0));

  // Empty state
  if (!hasData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-4xl font-bold text-foreground">
                {projectId ? 'Project Overview' : 'Compliance Dashboard'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              Real-time analytics and compliance monitoring
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No Data Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {projectId 
                ? 'Start analyzing your content by uploading documents in the Analyze tab'
                : 'Create a project and upload content to see analytics'}
            </p>
            {projectId && (
              <a
                href={`/projects/${projectId}/analyze`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Upload Content
              </a>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Data is already extracted by custom hooks
  const dashboardStats = stats;
  const trendData = trends;
  const heatmapData = heatmap;
  const violations = topViolations || [];
  const recent = recentSubmissions || [];

  // Mock data fallbacks for when API returns empty data
  const mockTrendData = {
    dates: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    }),
    scores: Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 75),
    counts: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 5),
  };

  const mockHeatmapData = {
    series: [
      { name: 'Critical', data: [0, 1, 0, 0] },
      { name: 'High', data: [2, 1, 0, 1] },
      { name: 'Medium', data: [1, 0, 2, 1] },
      { name: 'Low', data: [0, 1, 1, 0] },
    ],
    categories: ['IRDAI', 'Brand', 'SEO', 'General'],
  };

  const mockViolations = [
    { description: 'Missing disclaimer text', rule_text: 'Missing disclaimer text', count: 12, severity: 'high' as const, category: 'IRDAI' },
    { description: 'Incorrect brand color usage', rule_text: 'Incorrect brand color usage', count: 8, severity: 'medium' as const, category: 'Brand' },
    { description: 'SEO meta description too short', rule_text: 'SEO meta description too short', count: 6, severity: 'low' as const, category: 'SEO' },
    { description: 'Prohibited claim statement', rule_text: 'Prohibited claim statement', count: 5, severity: 'critical' as const, category: 'IRDAI' },
    { description: 'Font size below minimum', rule_text: 'Font size below minimum', count: 4, severity: 'medium' as const, category: 'Brand' },
  ];

  // Use real data if available, otherwise use mock data
  const displayTrendData = trendData?.dates?.length ? trendData : mockTrendData;
  const displayHeatmapData = heatmapData?.series?.length ? heatmapData : mockHeatmapData;
  const displayViolations = violations.length ? violations : mockViolations;

  // Calculate derived metrics
  const totalSubmissions = dashboardStats?.total_submissions || 1;
  const avgScore = dashboardStats?.avg_compliance_score || 85;
  const flaggedCount = dashboardStats?.flagged_count || 0;
  const pendingCount = dashboardStats?.pending_count || 0;
  const passedCount = Math.max(0, totalSubmissions - flaggedCount - pendingCount);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-4xl font-bold text-foreground">
              {projectId ? 'Project Overview' : 'Compliance Dashboard'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Real-time analytics and compliance monitoring
          </p>
        </motion.div>

        {/* Hero KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Submissions"
            value={totalSubmissions}
            icon={Users}
            color="indigo"
            trend={12}
          />
          <KPICard
            title="Average Score"
            value={Math.round(avgScore)}
            icon={TrendingUp}
            color="emerald"
            format="percentage"
            trend={5}
          />
          <KPICard
            title="Flagged"
            value={flaggedCount}
            icon={AlertCircle}
            color="amber"
            trend={-3}
          />
          <KPICard
            title="Pending Review"
            value={pendingCount}
            icon={Clock}
            color="red"
            trend={-8}
          />
        </div>

        {/* Compliance Trend + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Compliance Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ComplianceTrendChart
                dates={displayTrendData.dates}
                scores={displayTrendData.scores}
                counts={displayTrendData.counts}
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <CategoryRadar
                irdaiScore={avgScore}
                brandScore={avgScore - 5}
                seoScore={avgScore + 3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Radar + Top Violations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 relative">
              <StatusDonut passed={passedCount} flagged={flaggedCount} failed={pendingCount} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Top 5 Violations
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <TopViolationsChart violations={displayViolations} />
            </CardContent>
          </Card>
        </div>

        {/* Heatmap (Full Width) */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Violations Heatmap
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Violation count by severity and category
            </p>
          </CardHeader>
          <CardContent>
            <ViolationsHeatmap series={displayHeatmapData.series} categories={displayHeatmapData.categories} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Recent Activity
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest submissions and their status
            </p>
          </CardHeader>
          <CardContent>
            <ActivityTimeline submissions={recent} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
