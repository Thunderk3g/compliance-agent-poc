import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, FileText, Upload, Shield, AlertTriangle,
    CheckCircle2, Plus, File, Loader2, Trash2
} from 'lucide-react';
import { api } from '../lib/api';
import { Project, Guideline } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [guidelines, setGuidelines] = useState<Guideline[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rules' | 'analysis'>('rules');
    const [isUploading, setIsUploading] = useState(false);
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

            const [projRes, guideRes] = await Promise.all([
                api.getProject(id),
                api.getProjectGuidelines(id)
            ]);

            setProject(projRes.data);
            setGuidelines(guideRes.data);
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
        try {
            await api.uploadGuideline(id, file);
            // Refresh list
            const guideRes = await api.getProjectGuidelines(id);
            setGuidelines(guideRes.data);
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload guideline");
        } finally {
            setIsUploading(false);
            // Clear input
            if (fileInputRef.current) fileInputRef.current.value = '';
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
                        <button className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Settings
                        </button>
                    </div>
                </div>
            </div>

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
                                                    Added {new Date(guide.created_at).toLocaleDateString()}
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

                        {/* Rules Placeholder - In future fetch rules for project */}
                        <div className="pt-6 border-t mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Project Rules</h2>
                                <Link to="/admin" className="text-sm text-blue-600 hover:underline">Manage All Rules</Link>
                            </div>
                            <p className="text-gray-500 italic">
                                Rule list for this project is managed via the Admin panel in this MVP.
                            </p>
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
