import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { CategoryRadar } from '@/components/dashboard/CategoryRadar';
import { ComplianceTrendChart } from '@/components/dashboard/ComplianceTrendChart';
import { KPICard } from '@/components/dashboard/KPICard';
import { StatusDonut } from '@/components/dashboard/StatusDonut';
import { TopViolationsChart } from '@/components/dashboard/TopViolationsChart';
import { ViolationsHeatmap } from '@/components/dashboard/ViolationsHeatmap';
import {
  useDashboardStats,
  useDashboardTrends,
  useRecentSubmissions,
  useTopViolations,
  useViolationsHeatmap,
} from '@/services/dashboard';
import { motion } from 'framer-motion';
import { AlertTriangle, FileText, Shield, TrendingUp } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function ProjectDashboard() {
  const { id } = useParams<{ id: string }>();

  // Fetch project-specific dashboard data using custom hooks
  const { data: stats, isLoading: statsLoading } = useDashboardStats(id);
  const { data: trends, isLoading: trendsLoading } = useDashboardTrends(30, id);
  const { data: heatmap, isLoading: heatmapLoading } = useViolationsHeatmap(id);
  const { data: topViolations, isLoading: topViolationsLoading } = useTopViolations(5, id);
  const { data: recentSubmissions, isLoading: submissionsLoading } = useRecentSubmissions(id);

  const isLoading =
    statsLoading || trendsLoading || heatmapLoading || topViolationsLoading || submissionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-108px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Check if there's no data
  const hasData = stats && (stats.total_submissions > 0 || (topViolations && topViolations.length > 0) || (recentSubmissions && recentSubmissions.length > 0));

  // Empty state
  if (!hasData) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">Project Overview</h1>
          <p className="text-muted-foreground">Monitor compliance and track submissions</p>
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
            Start analyzing your content by uploading documents in the Analyze tab
          </p>
          <a
            href={`/projects/${id}/analyze`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Upload Content
          </a>
        </motion.div>
      </div>
    );
  }

  // Data is already extracted by custom hooks
  const topViolationsData = topViolations || [];
  const recentSubmissionsData = recentSubmissions || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Project Overview</h1>
        <p className="text-muted-foreground">Monitor compliance and track submissions</p>
      </motion.div>

      {/* Hero KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <KPICard
          title="Overall Score"
          value={stats?.overall_score || 0}
          format="percentage"
          trend={stats?.score_trend || 0}
          icon={TrendingUp}
          color="indigo"
        />
        <KPICard
          title="Total Submissions"
          value={stats?.total_submissions || 0}
          trend={stats?.submissions_trend || 0}
          icon={FileText}
          color="amber"
        />
        <KPICard
          title="Compliance Rate"
          value={stats?.compliance_rate || 0}
          format="percentage"
          trend={stats?.compliance_trend || 0}
          icon={Shield}
          color="emerald"
        />
        <KPICard
          title="Active Violations"
          value={stats?.active_violations || 0}
          trend={stats?.violations_trend || 0}
          icon={AlertTriangle}
          color="red"
        />
      </motion.div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Compliance Trend (Last 30 Days)
            </h3>
            <ComplianceTrendChart
              dates={trends?.dates || []}
              scores={trends?.scores || []}
              counts={trends?.counts || []}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Top Violations
            </h3>
            <TopViolationsChart violations={topViolationsData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Violations Heatmap
            </h3>
            <ViolationsHeatmap series={heatmap?.series || []} categories={heatmap?.categories || []} />
          </motion.div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Category Performance
            </h3>
            <CategoryRadar
              irdaiScore={stats?.category_scores?.irdai || 0}
              brandScore={stats?.category_scores?.brand || 0}
              seoScore={stats?.category_scores?.seo || 0}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Status Distribution
            </h3>
            <StatusDonut
              passed={stats?.status_distribution?.passed || 0}
              flagged={stats?.status_distribution?.flagged || 0}
              failed={stats?.status_distribution?.failed || 0}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Recent Activity
            </h3>
            <ActivityTimeline submissions={recentSubmissionsData} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
