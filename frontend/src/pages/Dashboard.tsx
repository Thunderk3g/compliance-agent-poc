import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DashboardStats } from '../lib/types';
import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">Total Submissions</div>
            <FileText className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats?.total_submissions || 0}</div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">Avg. Score</div>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats?.avg_compliance_score || 0}%</div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">Pending</div>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats?.pending_count || 0}</div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">Flagged</div>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats?.flagged_count || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome to Compliance Agent</h3>
        <p className="text-gray-600">
          Upload your marketing content to get AI-powered compliance analysis. The system checks for IRDAI regulations, brand guidelines, and SEO best practices.
        </p>
      </div>
    </div>
  );
};
