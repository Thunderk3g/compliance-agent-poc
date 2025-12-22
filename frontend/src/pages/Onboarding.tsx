import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { CheckCircle, Sparkles, Building2, Target, ArrowRight, ArrowLeft, Loader2, Upload, FileText, Trash2, FolderPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Industry options
const INDUSTRIES = [
    { value: 'insurance', label: 'Insurance', icon: '🛡️', description: 'IRDAI regulations & guidelines' },
    { value: 'healthcare', label: 'Healthcare', icon: '⚕️', description: 'HIPAA, FDA compliance' },
    { value: 'finance', label: 'Finance & Banking', icon: '💰', description: 'SEBI, RBI regulations' },
    { value: 'ecommerce', label: 'E-Commerce', icon: '🛒', description: 'Consumer protection laws' },
    { value: 'technology', label: 'Technology', icon: '💻', description: 'GDPR, data privacy' },
    { value: 'other', label: 'Other', icon: '🏢', description: 'General compliance' },
];

// Analysis scope options
const ANALYSIS_SCOPES = [
    {
        value: 'regulatory',
        label: 'Regulatory Compliance',
        icon: '⚖️',
        description: 'Industry-specific regulations and legal requirements'
    },
    {
        value: 'brand',
        label: 'Brand Guidelines',
        icon: '🎨',
        description: 'Brand voice, tone, and visual identity standards'
    },
    {
        value: 'seo',
        label: 'SEO Optimization',
        icon: '🔍',
        description: 'Search engine optimization best practices'
    },
    {
        value: 'qualitative',
        label: 'Qualitative Assessment',
        icon: '✨',
        description: 'Consumer-friendly language and readability'
    },
];

interface Rule {
    id: string;
    rule_text: string;
    category: string;
    severity: string;
    is_active: boolean;
}

const OnboardingWizard: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        industry: '',
        brand_name: '',
        brand_guidelines: '',
        analysis_scope: ['regulatory', 'brand', 'seo'] as string[],
        project_name: '',
        project_description: '',
    });

    // Project & Rules state
    const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [generatedRules, setGeneratedRules] = useState<Rule[]>([]);
    const [isGeneratingRules, setIsGeneratingRules] = useState(false);
    const [refineModalOpen, setRefineModalOpen] = useState(false);
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
    const [refineInstructions, setRefineInstructions] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    const totalSteps = 5; // Industry, Brand, Project, Upload, Review

    const handleIndustrySelect = (industry: string) => {
        setFormData({ ...formData, industry });
    };

    const handleScopeToggle = (scope: string) => {
        const currentScopes = formData.analysis_scope;
        if (currentScopes.includes(scope)) {
            setFormData({
                ...formData,
                analysis_scope: currentScopes.filter(s => s !== scope),
            });
        } else {
            setFormData({
                ...formData,
                analysis_scope: [...currentScopes, scope],
            });
        }
    };

    const handleNext = async () => {
        setError(null);

        // Handle Step 3 -> 4 transition (Create Project)
        if (step === 3) {
            setLoading(true);
            try {
                // FIXED: Just create the project. 
                // We moved away from api.startOnboarding() because it created global rules.
                // Rules will now be generated in the next step via guideline upload.
                const projectRes = await api.createProject({
                    name: formData.project_name,
                    description: formData.project_description || `${formData.brand_name} - ${formData.industry} project`
                });

                setCreatedProjectId(projectRes.data.id);
                setStep(step + 1);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to create project');
            } finally {
                setLoading(false);
            }
            return;
        }

        // Handle Step 4 -> 5 transition (Upload & Generate Rules)
        if (step === 4 && uploadedFile && createdProjectId) {
            setIsGeneratingRules(true);
            setError(null);
            try {
                const uploadRes = await api.uploadGuideline(createdProjectId, uploadedFile);

                // Fetch generated rules
                const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';
                const rulesRes = await api.getRules({
                    userId,
                    page: 1,
                    page_size: 100,
                    is_active: true
                });

                // Filter rules for this project's guidelines
                const projectRules = rulesRes.data.rules.filter(
                    (rule: Rule) => rule.is_active
                );

                setGeneratedRules(projectRules);
                setStep(step + 1);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to upload guideline');
            } finally {
                setIsGeneratingRules(false);
            }
            return;
        }

        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!createdProjectId) return;
        try {
            await api.deleteProjectRule(createdProjectId, ruleId);
            setGeneratedRules(generatedRules.filter(r => r.id !== ruleId));
        } catch (err) {
            console.error('Failed to delete rule:', err);
        }
    };

    const handleRefineRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createdProjectId || !selectedRuleId) return;

        setIsRefining(true);
        try {
            await api.refineProjectRule(createdProjectId, selectedRuleId, refineInstructions);
            setRefineModalOpen(false);

            // Refresh rules
            const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';
            const rulesRes = await api.getRules({
                userId,
                page: 1,
                page_size: 100,
                is_active: true
            });
            setGeneratedRules(rulesRes.data.rules.filter((r: Rule) => r.is_active));
        } catch (err) {
            console.error('Failed to refine rule:', err);
        } finally {
            setIsRefining(false);
        }
    };

    const handleComplete = () => {
        // FIXED: Redirect to the project page, not dashboard
        if (createdProjectId) {
            navigate(`/projects/${createdProjectId}`);
        } else {
            navigate('/projects');
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.industry !== '';
            case 2:
                return formData.brand_name.trim() !== '';
            case 3:
                return formData.project_name.trim() !== '';
            case 4:
                return uploadedFile !== null;
            case 5:
                return true;
            default:
                return false;
        }
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-semibold text-indigo-700">Adaptive Compliance Engine</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome! Let's Get Started</h1>
                    <p className="text-lg text-gray-600">
                        Set up your first project and compliance rules in just a few steps
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <div key={num} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${num < step
                                            ? 'bg-green-500 text-white'
                                            : num === step
                                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {num < step ? <CheckCircle className="w-5 h-5" /> : num}
                                </div>
                                {num < totalSteps && (
                                    <div
                                        className={`w-20 h-1 mx-2 transition-all ${num < step ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 px-2">
                        <span>Industry</span>
                        <span>Brand</span>
                        <span>Project</span>
                        <span>Upload</span>
                        <span>Review</span>
                    </div>
                </div>

                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Industry Selection */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <Building2 className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Select Your Industry</h2>
                                    <p className="text-gray-600">We'll find relevant regulations for you</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {INDUSTRIES.map((industry) => (
                                    <button
                                        key={industry.value}
                                        onClick={() => handleIndustrySelect(industry.value)}
                                        className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${formData.industry === industry.value
                                                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                                                : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="text-4xl">{industry.icon}</span>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{industry.label}</h3>
                                                <p className="text-sm text-gray-600">{industry.description}</p>
                                            </div>
                                            {formData.industry === industry.value && (
                                                <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Brand Information */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Tell Us About Your Brand</h2>
                                    <p className="text-gray-600">This helps us tailor the analysis</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Brand Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.brand_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, brand_name: e.target.value })
                                        }
                                        placeholder="e.g., SecureLife Insurance"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Brand Guidelines (Optional)
                                    </label>
                                    <textarea
                                        value={formData.brand_guidelines}
                                        onChange={(e) =>
                                            setFormData({ ...formData, brand_guidelines: e.target.value })
                                        }
                                        placeholder="Paste your brand guidelines here, or leave blank..."
                                        rows={6}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Adding guidelines helps generate more accurate brand compliance rules
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Create Project */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <FolderPlus className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Create Your First Project</h2>
                                    <p className="text-gray-600">Organize your compliance work by project</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Project Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.project_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, project_name: e.target.value })
                                        }
                                        placeholder="e.g., Q1 2024 Campaign"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={formData.project_description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, project_description: e.target.value })
                                        }
                                        placeholder="Brief description of this project..."
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Upload Guidelines */}
                    {step === 4 && (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <Upload className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Upload Your First Guideline</h2>
                                    <p className="text-gray-600">We'll automatically extract compliance rules</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept=".pdf,.docx,.txt,.md"
                                        className="hidden"
                                    />
                                    {uploadedFile ? (
                                        <div className="flex items-center justify-center gap-4">
                                            <FileText className="w-12 h-12 text-green-600" />
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(uploadedFile.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setUploadedFile(null)}
                                                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                Choose File
                                            </button>
                                            <p className="text-sm text-gray-500 mt-3">
                                                PDF, DOCX, TXT, or MD up to 10MB
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {isGeneratingRules && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                        <p className="text-sm text-blue-800">
                                            Generating rules from your guideline... This may take 30-60 seconds.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review Rules */}
                    {step === 5 && (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Review & Modify Rules</h2>
                                    <p className="text-gray-600">Generated {generatedRules.length} rules - Edit as needed</p>
                                </div>
                            </div>

                            {generatedRules.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No rules generated yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {generatedRules.map(rule => (
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
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRuleId(rule.id);
                                                            setRefineInstructions('');
                                                            setRefineModalOpen(true);
                                                        }}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Modify with AI"
                                                    >
                                                        <Sparkles className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRule(rule.id)}
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
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-12 pt-6 border-t">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all disabled:opacity-0 disabled:pointer-events-none"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>

                        {step < totalSteps ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed() || loading || isGeneratingRules}
                                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {loading || isGeneratingRules ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {step === 3 ? 'Creating Project...' : 'Generating Rules...'}
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Sparkles className="w-5 h-5" />
                                Go to Project
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Refine Rule Modal */}
            {refineModalOpen && (
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
                                <span className="sr-only">Close</span>
                                ×
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
            )}
        </div>
    );
};

export default OnboardingWizard;
