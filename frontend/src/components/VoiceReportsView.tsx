import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface VoiceReport {
    id: string;
    project_id: string;
    submission_id: string | null;
    transcript: string | null;
    sentiment_analysis: {
        overall_sentiment: string;
        confidence: number;
        positive_score: number;
        negative_score: number;
        neutral_score: number;
    } | null;
    tone_report: {
        primary_tone: string;
        secondary_tones: string[];
        emotional_indicators: Record<string, string>;
    } | null;
    created_at: string;
}

interface VoiceReportsViewProps {
    projectId: string;
}

export function VoiceReportsView({ projectId }: VoiceReportsViewProps) {
    const [reports, setReports] = useState<VoiceReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<VoiceReport | null>(null);
    const [analyzeLoading, setAnalyzeLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [projectId]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.getVoiceReportsByProject(projectId);
            setReports(response.data);
        } catch (error) {
            console.error('Failed to fetch voice reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        try {
            setAnalyzeLoading(true);
            await api.analyzeVoice(projectId);
            await fetchReports();
        } catch (error) {
            console.error('Failed to run voice analysis:', error);
        } finally {
            setAnalyzeLoading(false);
        }
    };

    const getSentimentColor = (sentiment: string | undefined) => {
        if (!sentiment) return 'bg-gray-100 text-gray-800';
        switch (sentiment.toLowerCase()) {
            case 'positive': return 'bg-green-100 text-green-800 border-green-200';
            case 'negative': return 'bg-red-100 text-red-800 border-red-200';
            case 'neutral': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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
                <Mic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Voice Reports Yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-1 mb-6">
                    Voice audit reports will appear here once analysis is run.
                </p>
                <button
                    onClick={handleAnalyze}
                    disabled={analyzeLoading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {analyzeLoading ? <TrendingUp className="w-4 h-4 mr-2 animate-spin" /> : <Mic className="w-4 h-4 mr-2" />}
                    Run Voice Audit
                </button>
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
                        <CardTitle>Voice Analysis Report</CardTitle>
                        <div className="flex gap-2 mt-2">
                            {selectedReport.sentiment_analysis && (
                                <Badge className={getSentimentColor(selectedReport.sentiment_analysis.overall_sentiment)}>
                                    {selectedReport.sentiment_analysis.overall_sentiment}
                                </Badge>
                            )}
                            {selectedReport.tone_report && (
                                <Badge variant="outline">{selectedReport.tone_report.primary_tone}</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {selectedReport.transcript && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Transcript</h4>
                                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                                    {selectedReport.transcript}
                                </div>
                            </div>
                        )}

                        {selectedReport.sentiment_analysis && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Sentiment Analysis</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="text-sm text-gray-600">Positive</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {(selectedReport.sentiment_analysis.positive_score * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="text-sm text-gray-600">Neutral</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {(selectedReport.sentiment_analysis.neutral_score * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <div className="text-sm text-gray-600">Negative</div>
                                        <div className="text-2xl font-bold text-red-600">
                                            {(selectedReport.sentiment_analysis.negative_score * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedReport.tone_report && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Tone Analysis</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Primary Tone:</span>
                                        <Badge variant="outline">{selectedReport.tone_report.primary_tone}</Badge>
                                    </div>
                                    {selectedReport.tone_report.secondary_tones.length > 0 && (
                                        <div>
                                            <span className="text-sm text-gray-600">Secondary Tones:</span>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {selectedReport.tone_report.secondary_tones.map((tone, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {tone}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                <h3 className="text-lg font-semibold text-gray-900">Voice Analysis Reports ({reports.length})</h3>
                <button
                    onClick={handleAnalyze}
                    disabled={analyzeLoading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {analyzeLoading ? <TrendingUp className="w-4 h-4 mr-2 animate-spin" /> : <Mic className="w-4 h-4 mr-2" />}
                    Run New Audit
                </button>
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
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <Mic className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-gray-900">Voice Report</h4>
                                            {report.sentiment_analysis && (
                                                <Badge className={`${getSentimentColor(report.sentiment_analysis.overall_sentiment)} text-xs`}>
                                                    {report.sentiment_analysis.overall_sentiment}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}
                                            </div>
                                            {report.tone_report && (
                                                <>
                                                    <span>•</span>
                                                    <span>Tone: {report.tone_report.primary_tone}</span>
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
