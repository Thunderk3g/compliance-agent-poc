import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface CreateProjectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: () => void;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ isOpen, onClose, onProjectCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [agentVoice, setAgentVoice] = useState(false);
    const [agentAnalytics, setAgentAnalytics] = useState(false);
    const [agentCompliance, setAgentCompliance] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError(null);

        try {
            await api.createProject({ 
                name, 
                description,
                agent_voice: agentVoice,
                agent_analytics: agentAnalytics,
                agent_compliance: agentCompliance
            });
            onProjectCreated();
            onClose();
            // Reset form
            setName('');
            setDescription('');
            setAgentVoice(false);
            setAgentAnalytics(false);
            setAgentCompliance(true);
        } catch (err: any) {
            console.error("Failed to create project:", err);
            setError("Failed to create project. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Q4 Marketing Campaign"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            autoFocus
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this project's scope..."
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Agents
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={agentCompliance}
                                    onChange={(e) => setAgentCompliance(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Regulatory Compliance Agent</div>
                                    <div className="text-xs text-gray-500">Check content against IRDAI/Brand/SEO rules</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={agentVoice}
                                    onChange={(e) => setAgentVoice(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Voice Audit Agent</div>
                                    <div className="text-xs text-gray-500">Analyze call transcripts for tone and sentiment</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={agentAnalytics}
                                    onChange={(e) => setAgentAnalytics(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">BI Analytics Agent</div>
                                    <div className="text-xs text-gray-500">Generate executive summaries and data insights</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create Project
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
