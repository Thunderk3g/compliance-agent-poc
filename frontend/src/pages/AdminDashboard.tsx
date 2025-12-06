import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Rule, RuleListResponse, RuleStats, RuleGenerationResponse } from '../lib/types';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

// POC: Hard-coded super admin user ID
// In production: Get from authentication context/JWT
const SUPER_ADMIN_USER_ID = 'super-admin-uuid-here';

export default function AdminDashboard() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [stats, setStats] = useState<RuleStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRules, setTotalRules] = useState(0);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<RuleGenerationResponse | null>(null);

  // Edit modal state
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Rule>>({});

  // Fetch rules
  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getRules({
        page: currentPage,
        page_size: 20,
        category: categoryFilter || undefined,
        severity: severityFilter || undefined,
        is_active: activeFilter,
        search: searchQuery || undefined,
        userId: SUPER_ADMIN_USER_ID,
      });

      const data: RuleListResponse = response.data;
      setRules(data.rules);
      setTotalPages(data.total_pages);
      setTotalRules(data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await api.getRuleStats(SUPER_ADMIN_USER_ID);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRules();
    fetchStats();
  }, [currentPage, categoryFilter, severityFilter, activeFilter, searchQuery]);

  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile || !documentTitle) {
      setError('Please select a file and enter a document title');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadResult(null);

      const response = await api.generateRulesFromDocument(
        uploadFile,
        documentTitle,
        SUPER_ADMIN_USER_ID
      );

      const result: RuleGenerationResponse = response.data;
      setUploadResult(result);

      if (result.success) {
        // Refresh rules list
        await fetchRules();
        await fetchStats();

        // Reset form
        setUploadFile(null);
        setDocumentTitle('');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate rules');
    } finally {
      setUploading(false);
    }
  };

  // Handle rule update
  const handleUpdateRule = async () => {
    if (!editingRule) return;

    try {
      await api.updateRule(editingRule.id, editFormData, SUPER_ADMIN_USER_ID);
      setEditingRule(null);
      setEditFormData({});
      await fetchRules();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update rule');
    }
  };

  // Handle rule delete
  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to deactivate this rule?')) return;

    try {
      await api.deleteRule(ruleId, SUPER_ADMIN_USER_ID);
      await fetchRules();
      await fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete rule');
    }
  };

  // Open edit modal
  const openEditModal = (rule: Rule) => {
    setEditingRule(rule);
    setEditFormData({
      rule_text: rule.rule_text,
      severity: rule.severity,
      category: rule.category,
      points_deduction: rule.points_deduction,
      is_active: rule.is_active,
      keywords: rule.keywords,
      pattern: rule.pattern,
    });
  };

  // Severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'irdai':
        return 'bg-purple-600';
      case 'brand':
        return 'bg-green-600';
      case 'seo':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-zinc-400 mt-1">Manage compliance rules and generation</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="text-zinc-400 text-sm">Total Rules</div>
              <div className="text-3xl font-bold mt-2">{stats.total_rules}</div>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="text-zinc-400 text-sm">Active Rules</div>
              <div className="text-3xl font-bold mt-2 text-green-500">{stats.active_rules}</div>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="text-zinc-400 text-sm">IRDAI Rules</div>
              <div className="text-3xl font-bold mt-2 text-purple-500">{stats.by_category.irdai}</div>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="text-zinc-400 text-sm">Critical Rules</div>
              <div className="text-3xl font-bold mt-2 text-red-500">{stats.by_severity.critical}</div>
            </Card>
          </div>
        )}

        {/* Upload Section */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Generate Rules from Document</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Title</label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g., IRDAI Marketing Guidelines 2024"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Document (PDF, DOCX, HTML, MD)</label>
              <input
                type="file"
                accept=".pdf,.docx,.html,.htm,.md,.markdown"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !uploadFile || !documentTitle}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {uploading ? 'Generating Rules...' : 'Generate Rules'}
            </button>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className={`mt-4 p-4 rounded-lg ${uploadResult.success ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}>
              <div className="font-semibold mb-2">
                {uploadResult.success ? '✅ Rules Generated Successfully' : '⚠️ Rule Generation Completed with Errors'}
              </div>
              <div className="text-sm space-y-1">
                <div>Created: {uploadResult.rules_created} rules</div>
                <div>Failed: {uploadResult.rules_failed} rules</div>
                {uploadResult.errors.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium">Errors:</div>
                    {uploadResult.errors.slice(0, 5).map((err, idx) => (
                      <div key={idx} className="text-xs text-red-300">{err}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Filter Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="irdai">IRDAI</option>
                <option value="brand">Brand</option>
                <option value="seo">SEO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={activeFilter === undefined ? '' : activeFilter ? 'true' : 'false'}
                onChange={(e) => setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rule text..."
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Rules Table */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Rules ({totalRules})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8 text-zinc-400">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">No rules found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800">
                  <tr className="text-left">
                    <th className="pb-3 pr-4 text-zinc-400 font-medium">Category</th>
                    <th className="pb-3 pr-4 text-zinc-400 font-medium">Severity</th>
                    <th className="pb-3 pr-4 text-zinc-400 font-medium">Rule Text</th>
                    <th className="pb-3 pr-4 text-zinc-400 font-medium">Points</th>
                    <th className="pb-3 pr-4 text-zinc-400 font-medium">Status</th>
                    <th className="pb-3 text-zinc-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-4 pr-4">
                        <Badge className={`${getCategoryColor(rule.category)} text-white`}>
                          {rule.category.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge className={`${getSeverityColor(rule.severity)} text-white`}>
                          {rule.severity}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 max-w-md">
                        <div className="truncate" title={rule.rule_text}>
                          {rule.rule_text}
                        </div>
                      </td>
                      <td className="py-4 pr-4 font-mono text-sm">
                        {rule.points_deduction}
                      </td>
                      <td className="py-4 pr-4">
                        <Badge className={rule.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 space-x-2">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:cursor-not-allowed rounded"
              >
                Previous
              </button>
              <span className="text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:cursor-not-allowed rounded"
              >
                Next
              </button>
            </div>
          )}
        </Card>

        {/* Edit Modal */}
        {editingRule && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="bg-zinc-900 border-zinc-800 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Edit Rule</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rule Text</label>
                  <textarea
                    value={editFormData.rule_text || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, rule_text: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={editFormData.category || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as any })}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="irdai">IRDAI</option>
                      <option value="brand">Brand</option>
                      <option value="seo">SEO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Severity</label>
                    <select
                      value={editFormData.severity || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, severity: e.target.value as any })}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Points Deduction</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.points_deduction || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, points_deduction: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editFormData.is_active || false}
                    onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm">Active</label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleUpdateRule}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingRule(null)}
                    className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
