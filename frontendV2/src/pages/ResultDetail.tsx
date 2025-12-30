import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    FileText,
    Shield,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Mock detailed result data - replace with actual API call
const mockDetailedResult = {
  id: '1',
  title: 'Q4 Life Insurance Campaign',
  date: '2024-01-15',
  status: 'failed',
  overallScore: 72.5,
  irdaiScore: 68.0,
  brandScore: 85.0,
  seoScore: 90.0,
  grade: 'C',
  aiSummary:
    'The content has several critical IRDAI compliance issues that need immediate attention. Brand guidelines are mostly followed, and SEO optimization is excellent.',
  violations: [
    {
      id: '1',
      severity: 'critical',
      category: 'IRDAI',
      description: 'Missing mandatory disclaimer about policy terms and conditions',
      location: 'Footer section, page 3',
      currentText: 'Get insured today with our comprehensive life insurance plans.',
      suggestedFix:
        'Get insured today with our comprehensive life insurance plans. *Terms and conditions apply. Please read the policy document carefully before purchasing.',
      isAutoFixable: true,
    },
    {
      id: '2',
      severity: 'critical',
      category: 'IRDAI',
      description: 'Prohibited claim about guaranteed returns',
      location: 'Main heading, page 1',
      currentText: 'Guaranteed 15% returns on your investment',
      suggestedFix: 'Potential returns up to 15% based on market performance',
      isAutoFixable: true,
    },
    {
      id: '3',
      severity: 'high',
      category: 'Brand',
      description: 'Incorrect brand color used for CTA button',
      location: 'Call-to-action section',
      currentText: 'Button color: #FF5733',
      suggestedFix: 'Use approved brand color: #0066CC',
      isAutoFixable: false,
    },
    {
      id: '4',
      severity: 'medium',
      category: 'SEO',
      description: 'Meta description exceeds recommended length',
      location: 'HTML head section',
      currentText: 'Current length: 180 characters',
      suggestedFix: 'Reduce to 150-160 characters for optimal display',
      isAutoFixable: false,
    },
  ],
};

export default function ResultDetail() {
  const { id, resultId } = useParams<{ id?: string; resultId: string }>();
  const navigate = useNavigate();
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(new Set());

  const isProjectContext = !!id;
  const result = mockDetailedResult;

  const toggleViolation = (violationId: string) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(violationId)) {
      newExpanded.delete(violationId);
    } else {
      newExpanded.add(violationId);
    }
    setExpandedViolations(newExpanded);
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
        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border ${
          variants[status as keyof typeof variants]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'bg-red-500/10 text-red-600 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      low: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
          variants[severity as keyof typeof variants]
        }`}
      >
        {severity.toUpperCase()}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      IRDAI: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      Brand: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      SEO: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
          variants[category as keyof typeof variants]
        }`}
      >
        {category}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleBack = () => {
    if (isProjectContext) {
      navigate(`/projects/${id}/results`);
    } else {
      navigate('/results');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{result.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(result.date).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>{result.violations.length} violations found</span>
              </div>
            </div>
            <div>{getStatusBadge(result.status)}</div>
          </div>
        </motion.div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-indigo-500/5 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{result.aiSummary}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Score Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>
              <p className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Grade: {result.grade}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">IRDAI Score</p>
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <p className={`text-4xl font-bold ${getScoreColor(result.irdaiScore)}`}>
                {result.irdaiScore}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">50% weight</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Brand Score</p>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className={`text-4xl font-bold ${getScoreColor(result.brandScore)}`}>
                {result.brandScore}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">30% weight</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">SEO Score</p>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className={`text-4xl font-bold ${getScoreColor(result.seoScore)}`}>
                {result.seoScore}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">20% weight</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Violations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Violations ({result.violations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {result.violations.map((violation, index) => (
                  <div key={violation.id} className="p-6 hover:bg-muted/30 transition-colors">
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => toggleViolation(violation.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-bold text-muted-foreground">
                            #{index + 1}
                          </span>
                          {getSeverityBadge(violation.severity)}
                          {getCategoryBadge(violation.category)}
                          {violation.isAutoFixable && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Auto-fixable
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {violation.description}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {violation.location}
                        </p>
                      </div>
                      <div className="ml-4">
                        {expandedViolations.has(violation.id) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {expandedViolations.has(violation.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-4"
                      >
                        {/* Current Text */}
                        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                          <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">
                            Current Text:
                          </p>
                          <p className="text-sm text-foreground">{violation.currentText}</p>
                        </div>

                        {/* Suggested Fix */}
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                          <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Suggested Fix:
                          </p>
                          <p className="text-sm text-foreground font-medium">
                            {violation.suggestedFix}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
