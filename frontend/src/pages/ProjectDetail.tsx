import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, FileText, Upload, Shield, AlertTriangle,
    CheckCircle2, Plus, File, Loader2, Trash2, Filter, Search
} from 'lucide-react';
import { api } from '../lib/api';
import { Project, Guideline } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rules' | 'analysis'>('rules');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) {
            fetchProjectData();
        }
    }, [id]);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            if (!id) return;

            const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';

            const [projRes, guideRes] = await Promise.all([
                api.getProject(id),
                api.getProjectGuidelines(id)
            ]);

            setProject(projRes.data);
            setGuidelines(guideRes.data);

            // Fetch all rules with proper pagination (max page_size is 100)
            const guidelineIds = guideRes.data.map((g: Guideline) => g.id);
            let allRules: Rule[] = [];
            let currentPage = 1;
            let hasMore = true;

            while (hasMore) {
                const rulesRes = await api.getRules({
                    userId,
                    page: currentPage,
                    page_size: 100
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
                                    <div key={guide.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
                                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                            Active
                                        </Badge>
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
                                            <div key={rule.id} className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
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
                        <div className="text-center py-16 bg-gray-50 rounded-xl">
                            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900">Project Analysis</h3>
                            <p className="text-gray-500 mt-2 mb-6">
                                Run compliance checks specifically against this project's rules.
                            </p>
                            <Link
                                to={`/upload?projectId=${id}`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            >
                                <Plus className="w-5 h-5" />
                                New Analysis
                            </Link>
                        </div>

                        <div className="border rounded-lg p-6 bg-white shadow-sm opacity-50">
                            <h3 className="text-lg font-semibold mb-3">Recent Reports</h3>
                            <p className="text-gray-400">Analysis history specific to this project will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
