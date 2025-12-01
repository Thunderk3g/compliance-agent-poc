import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ComplianceCheck } from '../lib/types';

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<ComplianceCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchResults();
    }
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await api.getComplianceResults(id!);
      setResults(response.data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!results) {
    return <div className="text-center py-12 text-gray-500">No results found</div>;
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Compliance Report</h2>
        <p className="text-gray-600 mt-2">{results.ai_summary}</p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Overall Score</div>
          <div className={`text-3xl font-bold ${getScoreColor(results.overall_score)}`}>
            {results.overall_score}%
          </div>
          <div className="mt-2">
            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
              Grade: {results.grade}
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getScoreColor(results.overall_score).replace('text-', 'bg-')}`}
              style={{ width: `${results.overall_score}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">IRDAI Compliance</div>
          <div className={`text-3xl font-bold ${getScoreColor(results.irdai_score)}`}>
            {results.irdai_score}%
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getScoreColor(results.irdai_score).replace('text-', 'bg-')}`}
              style={{ width: `${results.irdai_score}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Brand Guidelines</div>
          <div className={`text-3xl font-bold ${getScoreColor(results.brand_score)}`}>
            {results.brand_score}%
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getScoreColor(results.brand_score).replace('text-', 'bg-')}`}
              style={{ width: `${results.brand_score}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">SEO Health</div>
          <div className={`text-3xl font-bold ${getScoreColor(results.seo_score)}`}>
            {results.seo_score}%
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getScoreColor(results.seo_score).replace('text-', 'bg-')}`}
              style={{ width: `${results.seo_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Violations */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Violations ({results.violations.length})
        </h3>
        <div className="space-y-4">
          {results.violations.map((violation) => (
            <div
              key={violation.id}
              className={`border rounded-lg p-4 ${getSeverityColor(violation.severity)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium rounded bg-white">
                  {violation.severity.toUpperCase()}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded bg-white">
                  {violation.category}
                </span>
              </div>
              <p className="font-medium text-gray-900 mb-2">{violation.description}</p>
              {violation.location && (
                <p className="text-sm text-gray-600 mb-2">
                  Location: {violation.location}
                </p>
              )}
              {violation.current_text && (
                <div className="bg-white/50 p-2 rounded text-sm mb-2">
                  <p className="font-medium mb-1">Current:</p>
                  <p className="text-gray-700">{violation.current_text}</p>
                </div>
              )}
              {violation.suggested_fix && (
                <div className="bg-white/70 p-2 rounded text-sm">
                  <p className="font-medium mb-1">Suggested:</p>
                  <p className="text-gray-700">{violation.suggested_fix}</p>
                </div>
              )}
            </div>
          ))}

          {results.violations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No violations found. Great job!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
