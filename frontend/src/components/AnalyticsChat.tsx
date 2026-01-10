import React, { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { Send, Bot, User, BarChart2, Paperclip, FileText } from 'lucide-react';
import Chart from 'react-apexcharts';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    data?: any;
    chartType?: string;
}

interface AnalyticsChatProps {
    projectId: string;
}

export function AnalyticsChat({ projectId }: AnalyticsChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Hello! I am your Analytics Assistant. You can ask me about compliance trends, sales performance, or general insights from your data. Try asking: "Show me sales trends for Q3" or "Summarize recent violations".',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await api.uploadDataset(file);
            const datasetId = response.data.dataset_id;
            setActiveDatasetId(datasetId);
            
            const botMsg: ChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Success! I've ingested "${file.name}". You can now ask me to analyze this data.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload dataset.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.chatAnalytics(projectId, userMsg.content, activeDatasetId || undefined);
            const data = response.data;
            
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer,
                timestamp: new Date(),
                data: data.data,
                chartType: data.chart_type
            };
            
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Chat failed:', error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error analyzing your request. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const renderChart = (message: ChatMessage) => {
        if (!message.data || !message.chartType) return null;

        const chartOptions: any = {
            chart: {
                type: message.chartType,
                toolbar: { show: false },
                fontFamily: 'inherit'
            },
            colors: ['#3b82f6', '#10b981', '#f59e0b'],
            xaxis: message.data.xaxis,
            dataLabels: { enabled: false },
            grid: { borderColor: '#f3f4f6' },
            theme: { mode: 'light' }
        };

        return (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm w-full max-w-lg">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <BarChart2 className="w-3 h-3" /> Data Visualization
                </div>
                <Chart
                    options={chartOptions}
                    series={message.data.series}
                    type={message.chartType as any}
                    height={250}
                    width="100%"
                />
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[600px] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Analytics Assistant</h3>
                        <p className="text-xs text-gray-500">Ask questions about your data</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'
                        }`}>
                            {msg.role === 'user' ? 
                                <User className="w-4 h-4 text-white" /> : 
                                <Bot className="w-4 h-4 text-white" />
                            }
                        </div>
                        
                        <div className={`max-w-[80%] space-y-2`}>
                            <div className={`p-3 rounded-2xl text-sm ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                            }`}>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                            
                            {/* Chart Rendering */}
                            {msg.role === 'assistant' && msg.data && renderChart(msg)}
                            
                            <div className={`text-xs text-gray-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
                {activeDatasetId && (
                    <div className="mb-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full inline-flex items-center gap-1 border border-blue-100 animate-pulse">
                        <FileText size={12} />
                        Analying active dataset
                    </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Upload dataset"
                    >
                        <Paperclip size={20} className={uploading ? 'animate-spin' : ''} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={activeDatasetId ? "Ask about the dataset..." : "Ask a question about sales, compliance, or trends..."}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        disabled={loading || uploading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading || uploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
