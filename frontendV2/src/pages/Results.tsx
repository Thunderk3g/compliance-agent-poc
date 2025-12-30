import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  LayoutGrid,
  LayoutList,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Mock data - replace with actual API call
const mockResults = [
  {
    id: '1',
    title: 'Q4 Life Insurance Campaign',
    date: '2024-01-15',
    status: 'failed',
    overallScore: 72.5,
    irdaiScore: 68.0,
    brandScore: 85.0,
    seoScore: 90.0,
    violations: 12,
    criticalViolations: 2,
    highViolations: 4,
    mediumViolations: 6,
    category: 'IRDAI',
  },
  {
    id: '2',
    title: 'Term Insurance Landing Page',
    date: '2024-01-14',
    status: 'passed',
    overallScore: 92.3,
    irdaiScore: 95.0,
    brandScore: 88.0,
    seoScore: 94.0,
    violations: 3,
    criticalViolations: 0,
    highViolations: 0,
    mediumViolations: 3,
    category: 'Brand',
  },
  {
    id: '3',
    title: 'Health Insurance Email Campaign',
    date: '2024-01-13',
    status: 'flagged',
    overallScore: 81.7,
    irdaiScore: 78.0,
    brandScore: 82.0,
    seoScore: 88.0,
    violations: 7,
    criticalViolations: 1,
    highViolations: 2,
    mediumViolations: 4,
    category: 'SEO',
  },
];

type ViewMode = 'table' | 'accordion';

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const isProjectContext = !!id;

  const handleViewDetails = (resultId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isProjectContext) {
      navigate(`/projects/${id}/results/${resultId}`);
    } else {
      navigate(`/results/${resultId}`);
    }
  };

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      flagged: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      failed: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    const labels = {
      passed: 'Passed',
      flagged: 'Flagged',
      failed: 'Failed',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
          variants[status as keyof typeof variants]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getSeverityBadge = (count: number, type: 'critical' | 'high' | 'medium') => {
    if (count === 0) return null;
    const variants = {
      critical: 'bg-red-500/10 text-red-600 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
          variants[type]
        }`}
      >
        {count} {type}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {isProjectContext ? 'Project Results' : 'All Results'}
              </h1>
              <p className="text-muted-foreground">
                {isProjectContext
                  ? 'View compliance analysis results for this project'
                  : 'View compliance analysis results from all projects'}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('accordion')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'accordion'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Analyzed</p>
                  <p className="text-3xl font-bold text-foreground">{mockResults.length}</p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Passed</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {mockResults.filter((r) => r.status === 'passed').length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Flagged</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {mockResults.filter((r) => r.status === 'flagged').length}
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Failed</p>
                  <p className="text-3xl font-bold text-red-600">
                    {mockResults.filter((r) => r.status === 'failed').length}
                  </p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table View */}
        {viewMode === 'table' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Click on any row or use the View button to see detailed analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Content
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Overall Score
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Violations
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Category
                        </th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockResults.map((result, index) => (
                        <>
                          <motion.tr
                            key={result.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            onClick={() => handleViewDetails(result.id)}
                            className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                  <FileText className="w-4 h-4 text-indigo-500" />
                                </div>
                                <span className="font-medium text-foreground">{result.title}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {new Date(result.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-4">{getStatusBadge(result.status)}</td>
                            <td className="p-4">
                              <span className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
                                {result.overallScore}%
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {getSeverityBadge(result.criticalViolations, 'critical')}
                                {getSeverityBadge(result.highViolations, 'high')}
                                {getSeverityBadge(result.mediumViolations, 'medium')}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-muted-foreground">{result.category}</span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={(e) => handleViewDetails(result.id, e)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10 rounded-md transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            </td>
                          </motion.tr>
                          {expandedRows.has(result.id) && (
                            <tr>
                              <td colSpan={7} className="p-0">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-muted/20 p-6 border-b border-border"
                                >
                                  <div className="grid grid-cols-3 gap-6">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-2">
                                        IRDAI Score
                                      </p>
                                      <p className={`text-3xl font-bold ${getScoreColor(result.irdaiScore)}`}>
                                        {result.irdaiScore}%
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">50% weight</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Brand Score
                                      </p>
                                      <p className={`text-3xl font-bold ${getScoreColor(result.brandScore)}`}>
                                        {result.brandScore}%
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">30% weight</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-2">
                                        SEO Score
                                      </p>
                                      <p className={`text-3xl font-bold ${getScoreColor(result.seoScore)}`}>
                                        {result.seoScore}%
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">20% weight</p>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Accordion View */}
        {viewMode === 'accordion' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {mockResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className="bg-card border-border hover:shadow-md transition-shadow">
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleRow(result.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-indigo-500/10 rounded-lg">
                          <FileText className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{result.title}</CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(result.date).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{result.violations} violations</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(result.status)}
                        <div className="text-right">
                          <p className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                            {result.overallScore}%
                          </p>
                          <p className="text-xs text-muted-foreground">Overall</p>
                        </div>
                        {expandedRows.has(result.id) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {expandedRows.has(result.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <CardContent className="border-t border-border pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="p-4 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              IRDAI Compliance
                            </p>
                            <p className={`text-3xl font-bold ${getScoreColor(result.irdaiScore)}`}>
                              {result.irdaiScore}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">50% weight</p>
                          </div>
                          <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Brand Guidelines
                            </p>
                            <p className={`text-3xl font-bold ${getScoreColor(result.brandScore)}`}>
                              {result.brandScore}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">30% weight</p>
                          </div>
                          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              SEO Best Practices
                            </p>
                            <p className={`text-3xl font-bold ${getScoreColor(result.seoScore)}`}>
                              {result.seoScore}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">20% weight</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-medium text-foreground">Violations:</p>
                            {getSeverityBadge(result.criticalViolations, 'critical')}
                            {getSeverityBadge(result.highViolations, 'high')}
                            {getSeverityBadge(result.mediumViolations, 'medium')}
                          </div>
                          <button
                            onClick={(e) => handleViewDetails(result.id, e)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
