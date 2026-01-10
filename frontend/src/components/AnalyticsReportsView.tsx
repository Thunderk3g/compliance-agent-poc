import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, Target, Bot, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { AnalyticsChat } from './AnalyticsChat';

interface AnalyticsReport {
    id: string;
    project_id: string;
    bi_reasoning: string | null;
    data_insights: {
        content_volume: number;
        avg_content_length: number;
        quality_score: number;
        insights: string[];
    } | null;
    metrics: {
        total_chunks: number;
        processing_time_ms: number;
        quality_indicators: Record<string, number>;
    } | null;
    created_at: string;
}

interface AnalyticsReportsViewProps {
    projectId: string;
}

export function AnalyticsReportsView({ projectId }: AnalyticsReportsViewProps) {
    const [reports, setReports] = useState<AnalyticsReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<AnalyticsReport | null>(null);
    const [analyzeLoading, setAnalyzeLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'reports' | 'chat'>('reports');

    useEffect(() => {
        fetchReports();
    }, [projectId]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.getAnalyticsReportsByProject(projectId);
            setReports(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        try {
            setAnalyzeLoading(true);
            await api.analyzeAnalytics(projectId);
            await fetchReports();
        } catch (error) {
            console.error('Failed to trigger analytics analysis:', error);
        } finally {
            setAnalyzeLoading(false);
        }
    };

    if (viewMode === 'chat') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-blue-600" />
                        Analytics Assistant
                    </h3>
                    <button
                        onClick={() => setViewMode('reports')}
                        className="text-gray-600 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        View Reports
                    </button>
                </div>
                <AnalyticsChat projectId={projectId} />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Analytics Reports Yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-1 mb-6">
                    Business intelligence reports will appear here once analysis is run.
                </p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzeLoading}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {analyzeLoading ? <TrendingUp className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                        Generate BI Insights
                    </button>
                    <button
                        onClick={() => setViewMode('chat')}
                        className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Bot className="w-4 h-4 mr-2" />
                        Chat with Data
                    </button>
                </div>
            </div>
        );
    }

    if (selectedReport) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedReport(null)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        ← Back to Reports
                    </button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Business Intelligence Report</CardTitle>
                        <div className="text-sm text-gray-500">
                            {format(new Date(selectedReport.created_at), 'MMM d, yyyy h:mm a')}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {selectedReport.bi_reasoning && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Analysis Reasoning</h4>
                                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                                    {selectedReport.bi_reasoning}
                                </div>
                            </div>
                        )}

                        {selectedReport.data_insights && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <div className="text-sm text-gray-600">Content Volume</div>
                                            <div className="text-2xl font-bold text-blue-600">
                                                {selectedReport.data_insights.content_volume}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <div className="text-sm text-gray-600">Quality Score</div>
                                            <div className="text-2xl font-bold text-green-600">
                                                {(selectedReport.data_insights.quality_score * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <div className="text-sm text-gray-600">Avg Length</div>
                                            <div className="text-2xl font-bold text-purple-600">
                                                {selectedReport.data_insights.avg_content_length?.toFixed(0) || '0'}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedReport.data_insights.insights?.length > 0 && (
                                        <div className="space-y-2">
                                            {selectedReport.data_insights.insights.map((insight, idx) => (
                                                <div key={idx} className="flex items-start gap-2 p-3 bg-white border rounded-lg">
                                                    <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700">{insight}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedReport.metrics && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                                <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Chunks Processed:</span>
                                        <span className="font-medium">{selectedReport.metrics.total_chunks}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Processing Time:</span>
                                        <span className="font-medium">{selectedReport.metrics.processing_time_ms}ms</span>
                                    </div>
                                    {selectedReport.metrics.quality_indicators && Object.entries(selectedReport.metrics.quality_indicators).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-gray-600 capitalize">{key}:</span>
                                            <span className="font-medium">{(value * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Analytics Reports ({reports.length})</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('chat')}
                        className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Bot className="w-4 h-4 mr-2" />
                        Assistant
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzeLoading}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {analyzeLoading ? <TrendingUp className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                        Generate New Insights
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {reports.map(report => (
                    <Card
                        key={report.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedReport(report)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">Business Intelligence Report</h4>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}
                                            </div>
                                            {report.data_insights && (
                                                <>
                                                    <span>•</span>
                                                    <span>Quality: {(report.data_insights.quality_score * 100).toFixed(0)}%</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <TrendingUp className="w-5 h-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
