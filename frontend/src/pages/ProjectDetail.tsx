import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, FileText, Upload, Shield, AlertTriangle,
    CheckCircle2, Plus, File, Loader2, Trash2, Filter, Search, ArrowRight, X, Sparkles, MessageSquare,
    Mic, BarChart3, Settings
} from 'lucide-react';
import { api } from '../lib/api';
import { Results } from './Results';
import { VoiceReportsView } from '../components/VoiceReportsView';
import { AnalyticsReportsView } from '../components/AnalyticsReportsView';
import { Project, Guideline, Submission, AgentRegistryResponse } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Rule {
    id: string;
    rule_text: string;
    category: string;
    severity: string;
    is_active: boolean;
    created_at: string;
    source_guideline_id?: string;
}

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [guidelines, setGuidelines] = useState<Guideline[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rules' | 'analysis' | 'voice' | 'analytics' | 'settings'>('rules');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    // Upload state for analysis tab
    const [analysisFile, setAnalysisFile] = useState<File | null>(null);
    const [analysisTitle, setAnalysisTitle] = useState('');
    const [analysisType, setAnalysisType] = useState('html');
    const [isAnalysisUploading, setIsAnalysisUploading] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const analysisFileInputRef = useRef<HTMLInputElement>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Improve Rules Modal State
    const [improveModalOpen, setImproveModalOpen] = useState(false);
    const [selectedGuidelineId, setSelectedGuidelineId] = useState<string | null>(null);
    const [improveInstructions, setImproveInstructions] = useState('');
    const [isImproving, setIsImproving] = useState(false);

    // Refine Rule Modal State
    const [refineModalOpen, setRefineModalOpen] = useState(false);
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
    const [refineInstructions, setRefineInstructions] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    const [agentRegistry, setAgentRegistry] = useState<AgentRegistryResponse[]>([]);
    const [isTogglingAgent, setIsTogglingAgent] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) {
            fetchProjectData();
        }
    }, [id]);

    // Helper function to check if an agent is enabled
    const hasAgent = (agentType: string): boolean => {
        if (!project) return false;
        return project.agents?.some(agent => agent.agent_type === agentType && agent.enabled) || false;
    };

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            if (!id) return;

            const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';

            const [projRes, guideRes, subRes, registryRes] = await Promise.all([
                api.getProject(id),
                api.getProjectGuidelines(id),
                api.getSubmissions(id),
                api.getAgentRegistry()
            ]);

            setProject(projRes.data);
            setGuidelines(guideRes.data);
            setSubmissions(subRes.data);
            setAgentRegistry(registryRes.data);

            // Fetch all rules with proper pagination (max page_size is 100)
            const guidelineIds = guideRes.data.map((g: Guideline) => g.id);
            let allRules: Rule[] = [];
            let currentPage = 1;
            let hasMore = true;

            while (hasMore) {
                const rulesRes = await api.getRules({
                    userId,
                    page: currentPage,
                    page_size: 100,
                    is_active: true
                });

                // Filter rules for this project
                const pageRules = rulesRes.data.rules.filter(
                    (rule: Rule) => rule.source_guideline_id && guidelineIds.includes(rule.source_guideline_id)
                );

                allRules = [...allRules, ...pageRules];

                // Check if there are more pages
                hasMore = rulesRes.data.rules.length === 100;
                currentPage++;

                // Safety check to prevent infinite loops
                if (currentPage > 50) break;
            }

            setRules(allRules);
        } catch (err) {
            console.error("Failed to load project data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        setIsUploading(true);
        setUploadSuccess(null);
        try {
            const response = await api.uploadGuideline(id, file);
            const { rules_extracted, extraction_success, filename } = response.data;

            if (extraction_success) {
                setUploadSuccess(`Successfully uploaded "${filename}" and generated ${rules_extracted} rules!`);
                // Refresh data to show new guideline and rules
                await fetchProjectData();

                // Clear success message after 5 seconds
                setTimeout(() => setUploadSuccess(null), 5000);
            }
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload guideline");
        } finally {
            setIsUploading(false);
            // Clear input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Filter rules based on category, severity, and search
    const filteredRules = rules.filter(rule => {
        const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
        const matchesSeverity = filterSeverity === 'all' || rule.severity === filterSeverity;
        const matchesSearch = searchQuery === '' ||
            rule.rule_text.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSeverity && matchesSearch;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'irdai': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'brand': return 'bg-green-100 text-green-800 border-green-200';
            case 'seo': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Guideline Actions
    const handleDeleteGuideline = async (guidelineId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure? This will delete the guideline and all its generated rules.')) return;
        if (!id) return;

        try {
            await api.deleteGuideline(id, guidelineId);
            setUploadSuccess("Guideline deleted successfully");
            setTimeout(() => setUploadSuccess(null), 3000);
            fetchProjectData();
        } catch (err) {
            console.error("Failed to delete guideline:", err);
            alert("Failed to delete guideline");
        }
    };

    const openImproveModal = (guidelineId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedGuidelineId(guidelineId);
        setImproveInstructions('');
        setImproveModalOpen(true);
    };

    const handleImproveRules = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !selectedGuidelineId) return;

        setIsImproving(true);
        try {
            const res = await api.improveRules(id, selectedGuidelineId, improveInstructions);
            setImproveModalOpen(false);
            setUploadSuccess(`Success! Added ${res.data.rules_added} new rules.`);
            setTimeout(() => setUploadSuccess(null), 5000);
            fetchProjectData();
        } catch (err) {
            console.error("Failed to improve rules:", err);
            alert("Failed to improve rules");
        } finally {
            setIsImproving(false);
        }
    };

    const handleDeleteRule = async (ruleId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this rule?')) return;
        if (!id) return;

        try {
            await api.deleteProjectRule(id, ruleId);
            setUploadSuccess("Rule deleted successfully");
            setTimeout(() => setUploadSuccess(null), 3000);
            fetchProjectData();
        } catch (err) {
            console.error("Failed to delete rule:", err);
            alert("Failed to delete rule");
        }
    };

    const openRefineModal = (ruleId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedRuleId(ruleId);
        setRefineInstructions('');
        setRefineModalOpen(true);
    };

    const handleRefineRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !selectedRuleId) return;

        setIsRefining(true);
        try {
            await api.refineProjectRule(id, selectedRuleId, refineInstructions);
            setRefineModalOpen(false);
            setUploadSuccess("Rule refined successfully!");
            setTimeout(() => setUploadSuccess(null), 3000);
            fetchProjectData();
        } catch (err) {
            console.error("Failed to refine rule:", err);
            alert("Failed to refine rule");
        } finally {
            setIsRefining(false);
        }
    };

    // Submission Actions
    const handleAnalysisUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!analysisFile || !analysisTitle || !id) return;

        setIsAnalysisUploading(true);
        setAnalysisError(null);

        try {
            const formData = new FormData();
            formData.append('title', analysisTitle);
            formData.append('content_type', analysisType);
            formData.append('file', analysisFile);
            formData.append('project_id', id);

            await api.uploadSubmission(formData);

            // Reset form
            setAnalysisFile(null);
            setAnalysisTitle('');
            if (analysisFileInputRef.current) analysisFileInputRef.current.value = '';

            // Refresh submissions
            const subRes = await api.getSubmissions(id);
            setSubmissions(subRes.data);

            setUploadSuccess("Content uploaded successfully!");
            setTimeout(() => setUploadSuccess(null), 3000);
        } catch (err: any) {
            console.error("Upload failed:", err);
            setAnalysisError(err.response?.data?.detail || "Upload failed");
        } finally {
            setIsAnalysisUploading(false);
        }
    };

    const handleAnalyze = async (submissionId: string) => {
        setActionLoading(prev => ({ ...prev, [submissionId]: true }));
        try {
            await api.analyzeSubmission(submissionId);
            const subRes = await api.getSubmissions(id);
            setSubmissions(subRes.data);
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed. Please try again.');
        } finally {
            setActionLoading(prev => ({ ...prev, [submissionId]: false }));
        }
    };

    const handlePreprocess = async (submissionId: string) => {
        setActionLoading(prev => ({ ...prev, [submissionId]: true }));
        try {
            await api.triggerPreprocessing(submissionId);
            const subRes = await api.getSubmissions(id);
            setSubmissions(subRes.data);
        } catch (error) {
            console.error('Preprocessing failed:', error);
            alert('Preprocessing failed. Please try again.');
        } finally {
            setActionLoading(prev => ({ ...prev, [submissionId]: false }));
        }
    };

    const handleDeleteSubmission = async (submissionId: string) => {
        if (!confirm('Start fresh? Deleting this submission removes all analysis history.')) return;

        setActionLoading(prev => ({ ...prev, [submissionId]: true }));
        try {
            await api.deleteSubmission(submissionId);
            const subRes = await api.getSubmissions(id);
            setSubmissions(subRes.data);
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setActionLoading(prev => ({ ...prev, [submissionId]: false }));
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            uploaded: 'bg-yellow-100 text-yellow-800',
            preprocessing: 'bg-indigo-100 text-indigo-800',
            preprocessed: 'bg-purple-100 text-purple-800',
            analyzing: 'bg-blue-100 text-blue-800',
            analyzed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            waiting_for_review: 'bg-amber-100 text-amber-800 border-amber-200',
        };
        return <Badge className={`${colors[status] || 'bg-gray-100'} border-0`}>{status}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!project) {
        return <div className="text-center py-12">Project not found</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <Link to="/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Projects
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                        <p className="text-gray-600 mt-1">{project.description || "Project Workspace"}</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Total Rules</div>
                            <div className="text-2xl font-bold text-blue-600">{rules.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {uploadSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{uploadSuccess}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'rules'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
                    >
                        <Shield className="w-4 h-4 inline-block mr-2" />
                        Rules & Guidelines
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'analysis'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
                    >
                        <FileText className="w-4 h-4 inline-block mr-2" />
                        Content Analysis
                    </button>
                    {hasAgent('voice') && (
                        <button
                            onClick={() => setActiveTab('voice')}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === 'voice'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            <Mic className="w-4 h-4 inline-block mr-2" />
                            Voice Audit
                        </button>
                    )}
                    {hasAgent('analytics') && (
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === 'analytics'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            <BarChart3 className="w-4 h-4 inline-block mr-2" />
                            BI Analytics
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'settings'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        <Settings className="w-4 h-4 inline-block mr-2" />
                        Settings
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'rules' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Guidelines</h2>
                            <div>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".pdf,.docx,.txt,.md"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    Upload Guideline
                                </button>
                            </div>
                        </div>

                        {/* Guidelines Grid */}
                        {guidelines.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No guidelines yet</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-1">
                                    Upload a policy document (PDF, DOCX) to automatically extract compliance rules for this project.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {guidelines.map(guide => (
                                    <div key={guide.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{guide.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Added {new Date(guide.created_at).toLocaleDateString()} •
                                                    {' '}{rules.filter(r => r.source_guideline_id === guide.id).length} rules generated
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => openImproveModal(guide.id, e)}
                                                className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100"
                                            >
                                                <Sparkles className="w-3 h-3" />
                                                Improve Rules
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteGuideline(guide.id, e)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                                                title="Delete Guideline"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                                Active
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Project Rules Section */}
                        <div className="pt-6 border-t mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Generated Rules ({filteredRules.length})
                                </h2>
                            </div>

                            {rules.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl">
                                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">
                                        No rules generated yet. Upload a guideline to get started.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Filters */}
                                    <div className="flex gap-4 mb-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Search rules..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="irdai">IRDAI</option>
                                            <option value="brand">Brand</option>
                                            <option value="seo">SEO</option>
                                        </select>
                                        <select
                                            value={filterSeverity}
                                            onChange={(e) => setFilterSeverity(e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="all">All Severities</option>
                                            <option value="critical">Critical</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>

                                    {/* Rules List */}
                                    <div className="space-y-3">
                                        {filteredRules.map(rule => (
                                            <div key={rule.id} className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow group">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-gray-900 font-medium">{rule.rule_text}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <Badge className={`${getCategoryColor(rule.category)} text-xs`}>
                                                                {rule.category.toUpperCase()}
                                                            </Badge>
                                                            <Badge className={`${getSeverityColor(rule.severity)} text-xs`}>
                                                                {rule.severity}
                                                            </Badge>

                                                            {rule.is_active ? (
                                                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                                                    Active
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                                                                    Inactive
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => openRefineModal(rule.id, e)}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="Modify with AI"
                                                        >
                                                            <Sparkles className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteRule(rule.id, e)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Rule"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className="space-y-6 animate-slide-up">
                        {selectedSubmissionId ? (
                            <div className="bg-white rounded-xl shadow-sm border p-1">
                                <div className="p-4 border-b flex items-center justify-between bg-gray-50 rounded-t-lg">
                                    <button
                                        onClick={() => setSelectedSubmissionId(null)}
                                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Submissions
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Viewing Report</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <Results submissionId={selectedSubmissionId} />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* New Analysis Upload Form */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">New Content Analysis</CardTitle>
                                        <CardDescription>Upload content to check against this project's rules</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {analysisError && (
                                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                                                {analysisError}
                                            </div>
                                        )}
                                        <form onSubmit={handleAnalysisUpload} className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={analysisTitle}
                                                    onChange={e => setAnalysisTitle(e.target.value)}
                                                    placeholder="e.g. Q1 Campaign Draft"
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                <select
                                                    value={analysisType}
                                                    onChange={e => setAnalysisType(e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="html">HTML</option>
                                                    <option value="markdown">Markdown</option>
                                                    <option value="pdf">PDF</option>
                                                    <option value="docx">DOCX</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        ref={analysisFileInputRef}
                                                        onChange={e => setAnalysisFile(e.target.files?.[0] || null)}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                                        accept=".html,.md,.pdf,.docx"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isAnalysisUploading}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 h-[42px] min-w-[100px] flex items-center justify-center"
                                            >
                                                {isAnalysisUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
                                            </button>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Recent Reports List */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Analysis Reports</h3>

                                    {submissions.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed text-gray-400">
                                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No content analyzed yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {submissions.map(sub => (
                                                <div key={sub.id} className="p-4 bg-white border rounded-xl hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium text-gray-900 truncate">{sub.title}</h4>
                                                            {getStatusBadge(sub.status)}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                                            <span className="uppercase text-xs font-bold tracking-wider">{sub.content_type}</span>
                                                            <span>•</span>
                                                            <span>{format(new Date(sub.submitted_at), 'MMM d, yyyy h:mm a')}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {/* Preprocess Action */}
                                                        {(sub.status === 'uploaded' || sub.status === 'pending') && (
                                                            <button
                                                                onClick={() => handlePreprocess(sub.id)}
                                                                disabled={actionLoading[sub.id]}
                                                                className="px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                                            >
                                                                {actionLoading[sub.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Preprocess'}
                                                            </button>
                                                        )}

                                                        {/* Analyze Action */}
                                                        {(sub.status === 'preprocessed' || sub.status === 'pending') && (
                                                            <button
                                                                onClick={() => handleAnalyze(sub.id)}
                                                                disabled={actionLoading[sub.id]}
                                                                className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                            >
                                                                {actionLoading[sub.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
                                                            </button>
                                                        )}

                                                        {/* Review Action */}
                                                        {sub.status === 'waiting_for_review' && (
                                                            <button
                                                                onClick={() => setSelectedSubmissionId(sub.id)}
                                                                className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1 animate-pulse"
                                                            >
                                                                Review Now <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                        )}

                                                        {/* View Results Action */}
                                                        {(sub.status === 'analyzed' || sub.status === 'completed') && (
                                                            <button
                                                                onClick={() => setSelectedSubmissionId(sub.id)}
                                                                className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1"
                                                            >
                                                                View Report <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleDeleteSubmission(sub.id)}
                                                            disabled={actionLoading[sub.id]}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Analysis"
                                                        >
                                                            {actionLoading[sub.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'voice' && project.agent_voice && (
                    <div className="animate-slide-up">
                        <VoiceReportsView projectId={id!} />
                    </div>
                )}

                {activeTab === 'analytics' && project.agent_analytics && (
                    <div className="animate-slide-up">
                        <AnalyticsReportsView projectId={id!} />
                    </div>
                )}

                {activeTab === 'settings' && project && (
                    <div className="space-y-6 animate-slide-up">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-gray-400" />
                                    Project Settings
                                </CardTitle>
                                <CardDescription>Manage your project's active agents and configuration.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            Active Agents
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {agentRegistry.filter(a => a.is_active).map((agent) => {
                                                const isEnabled = hasAgent(agent.agent_type);
                                                const isLoading = isTogglingAgent === agent.agent_type;

                                                return (
                                                    <div 
                                                        key={agent.agent_type}
                                                        className={`flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm transition-all ${isEnabled ? 'border-blue-200 shadow-md' : 'hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                                                {agent.agent_type === 'voice' ? <Mic className="w-5 h-5" /> : 
                                                                 agent.agent_type === 'analytics' ? <BarChart3 className="w-5 h-5" /> :
                                                                 <Shield className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{agent.display_name}</div>
                                                                <div className="text-xs text-gray-500">{agent.description}</div>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            disabled={isLoading}
                                                            onClick={async () => {
                                                                try {
                                                                    setIsTogglingAgent(agent.agent_type);
                                                                    await api.toggleProjectAgent(id!, agent.agent_type);
                                                                    // Refresh project to get updated agents list
                                                                    const res = await api.getProject(id!);
                                                                    setProject(res.data);
                                                                } catch (e) {
                                                                    console.error("Toggle failed", e);
                                                                } finally {
                                                                    setIsTogglingAgent(null);
                                                                }
                                                            }}
                                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
            {/* Improve Rules Modal */}
            {
                improveModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-scale-in">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-600" />
                                        Improve Rules
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Use AI to extract more specific rules.</p>
                                </div>
                                <button
                                    onClick={() => setImproveModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleImproveRules} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Instructions for AI
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none min-h-[100px] resize-none"
                                        placeholder="e.g. 'Focus on extracting rules related to payment timelines' or 'Find specific prohibitions regarding logos'"
                                        value={improveInstructions}
                                        onChange={(e) => setImproveInstructions(e.target.value)}
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                                        <MessageSquare className="w-3 h-3 mt-0.5" />
                                        <span>The AI will re-scan the document with these specific instructions to find additional rules.</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setImproveModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isImproving || !improveInstructions.trim()}
                                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        {isImproving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Generate Rules
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Refine Rule Modal */}
            {
                refineModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-scale-in">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-600" />
                                        Modify Rule with AI
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Refine this specific rule using AI.</p>
                                </div>
                                <button
                                    onClick={() => setRefineModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleRefineRule} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Instructions for AI
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none min-h-[100px] resize-none"
                                        placeholder="e.g. 'Change the severity to High' or 'Make the rule more lenient regarding typos'"
                                        value={refineInstructions}
                                        onChange={(e) => setRefineInstructions(e.target.value)}
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                                        <MessageSquare className="w-3 h-3 mt-0.5" />
                                        <span>The AI will rewrite this specific rule based on your instructions.</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setRefineModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isRefining || !refineInstructions.trim()}
                                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        {isRefining ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Refining...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Refine Rule
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
