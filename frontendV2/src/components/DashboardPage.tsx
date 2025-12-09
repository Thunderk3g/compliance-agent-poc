
import { ShinyButton } from '@/components/react-bits/ShinyButton';
import { cn } from '@/lib/utils';
import type { ApexOptions } from 'apexcharts';
import ReactECharts from 'echarts-for-react';
import { LucideAlertCircle, LucideCheckCircle, LucideFileText, LucideGlobe, LucideLayoutDashboard, LucideTrendingUp } from 'lucide-react';
import Chart from 'react-apexcharts';

// Mock Data
const stats = {
  overall_score: 92,
  total_submissions: 124,
  flagged_count: 8,
  pending_count: 5
};

export default function DashboardPage() {
  // const [activeTab, setActiveTab] = useState('overview');

  // 1. HERO GAUGE (ECharts)
  const heroGaugeOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        radius: '85%',
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: { color: '#4F46E5' }, // Sphere Blue
        },
        axisLine: {
          lineStyle: {
            width: 28,
            color: [[1, '#E2E8F0']], // Muted color for empty part
          },
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        data: [{ value: stats.overall_score, itemStyle: { color: '#4F46E5' } }],
        detail: {
            show: false
        },
      },
    ],
    backgroundColor: 'transparent',
  };

  // 2. TREND CHART (Apex)
  const trendOptions: ApexOptions = {
    chart: { type: 'area', fontFamily: 'Inter, sans-serif', toolbar: { show: false }, background: 'transparent' },
    colors: ['#4F46E5'],
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    grid: { borderColor: 'rgba(128,128,128, 0.1)', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    xaxis: { 
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 
        axisBorder: { show: false }, 
        axisTicks: { show: false },
        labels: { style: { colors: '#64748B' } }
    },
    yaxis: { 
        show: true,
        labels: { style: { colors: '#64748B' } }
    },
    theme: { mode: 'light' } // We can toggle this based on dark mode context later
  };
  const trendSeries = [{ name: 'Compliance Score', data: [85, 88, 92, 90, 94, 93, 96] }];

  // 3. HEATMAP
  const heatmapOptions: ApexOptions = {
    chart: { type: 'heatmap', fontFamily: 'Inter, sans-serif', toolbar: { show: false }, background: 'transparent' },
    plotOptions: { heatmap: { shadeIntensity: 0.5, colorScale: { ranges: [{ from: 0, to: 5, color: '#10B981' }, { from: 6, to: 10, color: '#F59E0B' }, { from: 11, to: 100, color: '#EF4444' }] } } },
    dataLabels: { enabled: false },
    xaxis: { labels: { style: { colors: '#64748B' } } },
    yaxis: { labels: { style: { colors: '#64748B' } } }
  };
  const heatmapSeries = [
    { name: 'Critical', data: [1, 2, 0] },
    { name: 'High', data: [0, 4, 1] },
    { name: 'Medium', data: [3, 2, 5] },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in-up">
      {/* Dashboard Header */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
                <LucideLayoutDashboard className="w-5 h-5 text-primary" />
                Compliance Dashboard
            </h1>
        </div>
        <div className="flex items-center gap-4">
             <div className="text-sm text-muted-foreground hidden md:block">Last updated: Just now</div>
             <ShinyButton className="px-4 py-2 text-sm !rounded-lg bg-primary text-white">New Audit</ShinyButton>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Submissions" value={stats.total_submissions} icon={LucideFileText} color="bg-blue-500" />
            <StatCard label="Avg Compliance" value={`${stats.overall_score}%`} icon={LucideCheckCircle} color="bg-green-500" />
            <StatCard label="Issues Flagged" value={stats.flagged_count} icon={LucideAlertCircle} color="bg-amber-500" />
            <StatCard label="Pending Review" value={stats.pending_count} icon={LucideGlobe} color="bg-purple-500" />
        </div>

        {/* Hero Section: Gauge & Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gauge Card */}
            <div className="card p-8 bg-card border border-border rounded-3xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-lg font-semibold mb-4 text-foreground relative z-10">Overall Compliance Status</h3>
                <div className="relative h-[250px] flex items-center justify-center">
                     <ReactECharts option={heroGaugeOption} style={{ height: '300px', width: '100%', position: 'absolute', top: -20 }} />
                     <div className="text-center mt-10">
                        <div className="text-5xl font-extrabold text-foreground">{stats.overall_score}</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Excellent</div>
                     </div>
                </div>
            </div>

            {/* Compliance Trend Chart */}
            <div className="col-span-1 lg:col-span-2 card p-8 bg-card border border-border rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <LucideTrendingUp className="w-5 h-5 text-green-500" />
                        Compliance Trend
                    </h3>
                    <select className="bg-background border border-border text-sm rounded-lg px-3 py-1 text-foreground">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
                <div className="h-[250px] w-full">
                    <Chart options={trendOptions} series={trendSeries} type="area" height="100%" />
                </div>
            </div>
        </div>

        {/* Bottom Section: Heatmap & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-8 bg-card border border-border rounded-3xl shadow-sm">
                 <h3 className="text-lg font-semibold mb-6 text-foreground">Violation Heatmap</h3>
                 <div className="h-[300px]">
                    <Chart options={heatmapOptions} series={heatmapSeries} type="heatmap" height="100%" />
                 </div>
            </div>

            <div className="card p-8 bg-card border border-border rounded-3xl shadow-sm flex flex-col">
                 <h3 className="text-lg font-semibold mb-6 text-foreground">Recent Activity</h3>
                 <div className="flex-1 space-y-4">
                    <ActivityItem title="Policy Update v2.4" time="2 hours ago" status="Passed" />
                    <ActivityItem title="Marketing Brochure Q3" time="4 hours ago" status="Flagged" />
                    <ActivityItem title="Email Campaign: 'Summer Sale'" time="Yesterday" status="Passed" />
                    <ActivityItem title="Landing Page Terms" time="Yesterday" status="Pending" />
                 </div>
                 <ShinyButton variant="outline" className="w-full mt-6 text-foreground border-border hover:bg-muted">View All Activity</ShinyButton>
            </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="card p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
                </div>
                <div className={cn("p-3 rounded-xl text-white", color)}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    )
}

function ActivityItem({ title, time, status }: any) {
    const statusColor = status === 'Passed' ? 'text-green-500 bg-green-500/10' : 
                       status === 'Flagged' ? 'text-red-500 bg-red-500/10' : 
                       'text-amber-500 bg-amber-500/10';
    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div>
                    <div className="font-medium text-sm text-foreground">{title}</div>
                    <div className="text-xs text-muted-foreground">{time}</div>
                </div>
            </div>
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", statusColor)}>
                {status}
            </span>
        </div>
    )
}
