import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  FileText,
  FolderPlus,
  Sparkles,
  Target,
  Trash2,
  Upload
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    description: 'Industry-specific regulations and legal requirements',
  },
  {
    value: 'brand',
    label: 'Brand Guidelines',
    icon: '🎨',
    description: 'Brand voice, tone, and visual identity standards',
  },
  {
    value: 'seo',
    label: 'SEO Optimization',
    icon: '🔍',
    description: 'Search engine optimization best practices',
  },
  {
    value: 'qualitative',
    label: 'Qualitative Assessment',
    icon: '✨',
    description: 'Consumer-friendly language and readability',
  },
];

interface Rule {
  id: string;
  rule_text: string;
  category: string;
  severity: string;
  is_active: boolean;
}

export default function OnboardingPage() {
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

  const totalSteps = 5;

  const handleIndustrySelect = (industry: string) => {
    setFormData({ ...formData, industry });
  };

  const handleScopeToggle = (scope: string) => {
    const currentScopes = formData.analysis_scope;
    if (currentScopes.includes(scope)) {
      setFormData({
        ...formData,
        analysis_scope: currentScopes.filter((s) => s !== scope),
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
        const projectRes = await api.createProject({
          name: formData.project_name,
          description:
            formData.project_description ||
            `${formData.brand_name} - ${formData.industry} project`,
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
        await api.uploadGuideline(createdProjectId, uploadedFile);

        // Fetch generated rules
        const userId =
          localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';
        const rulesRes = await api.getRules({
          userId,
          page: 1,
          page_size: 100,
          is_active: true,
        });

        const projectRules = rulesRes.data.rules.filter((rule: Rule) => rule.is_active);
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

  const handleComplete = () => {
    // Always redirect to projects page after completion
    navigate('/projects');
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

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Adaptive Compliance Engine
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Welcome! Let's Get Started
          </h1>
          <p className="text-lg text-muted-foreground">
            Set up your first project and compliance rules in just a few steps
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: num === step ? 1.1 : 1,
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    num < step
                      ? 'bg-foreground text-background'
                      : num === step
                      ? 'bg-foreground text-background ring-4 ring-border'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {num < step ? <CheckCircle className="w-5 h-5" /> : num}
                </motion.div>
                {num < totalSteps && (
                  <div
                    className={`w-20 h-1 mx-2 transition-all ${
                      num < step
                        ? 'bg-foreground'
                        : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            <span>Industry</span>
            <span>Brand</span>
            <span>Project</span>
            <span>Upload</span>
            <span>Review</span>
          </div>
        </div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-xl border border-border p-8 sm:p-12"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg"
            >
              <p className="text-red-500 text-sm">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Industry Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-8 h-8 text-foreground" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Select Your Industry
                    </h2>
                    <p className="text-muted-foreground">
                      We'll find relevant regulations for you
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {INDUSTRIES.map((industry) => (
                    <motion.button
                      key={industry.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleIndustrySelect(industry.value)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        formData.industry === industry.value
                          ? 'border-foreground bg-accent ring-2 ring-border'
                          : 'border-border hover:border-foreground/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{industry.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {industry.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {industry.description}
                          </p>
                        </div>
                        {formData.industry === industry.value && (
                          <CheckCircle className="w-6 h-6 text-foreground flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Brand Information */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-foreground" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Tell Us About Your Brand
                    </h2>
                    <p className="text-muted-foreground">
                      This helps us tailor the analysis
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <Input
                    label="Brand Name *"
                    value={formData.brand_name}
                    onChange={(e) =>
                      setFormData({ ...formData, brand_name: e.target.value })
                    }
                    placeholder="e.g., SecureLife Insurance"
                  />

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Brand Guidelines (Optional)
                    </label>
                    <textarea
                      value={formData.brand_guidelines}
                      onChange={(e) =>
                        setFormData({ ...formData, brand_guidelines: e.target.value })
                      }
                      placeholder="Paste your brand guidelines here, or leave blank..."
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-input rounded-lg bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Adding guidelines helps generate more accurate brand compliance rules
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Create Project */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FolderPlus className="w-8 h-8 text-foreground" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Create Your First Project
                    </h2>
                    <p className="text-muted-foreground">
                      Organize your compliance work by project
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <Input
                    label="Project Name *"
                    value={formData.project_name}
                    onChange={(e) =>
                      setFormData({ ...formData, project_name: e.target.value })
                    }
                    placeholder="e.g., Q1 2024 Campaign"
                  />

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.project_description}
                      onChange={(e) =>
                        setFormData({ ...formData, project_description: e.target.value })
                      }
                      placeholder="Brief description of this project..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-input rounded-lg bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Upload Guidelines */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Upload className="w-8 h-8 text-foreground" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Upload Your First Guideline
                    </h2>
                    <p className="text-muted-foreground">
                      We'll automatically extract compliance rules
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground/50 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.docx,.txt,.md"
                      className="hidden"
                    />
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-4">
                        <FileText className="w-12 h-12 text-green-500" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">
                            {uploadedFile.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <Button onClick={() => fileInputRef.current?.click()}>
                          Choose File
                        </Button>
                        <p className="text-sm text-muted-foreground mt-3">
                          PDF, DOCX, TXT, or MD up to 10MB
                        </p>
                      </div>
                    )}
                  </div>

                  {isGeneratingRules && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-center gap-3">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                      <p className="text-sm text-blue-500">
                        Generating rules from your guideline... This may take 30-60 seconds.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 5: Review Rules */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-foreground" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Review & Modify Rules
                    </h2>
                    <p className="text-muted-foreground">
                      Generated {generatedRules.length} rules - Edit as needed
                    </p>
                  </div>
                </div>

                {generatedRules.length === 0 ? (
                  <div className="text-center py-12 bg-muted/50 rounded-xl">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No rules generated yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generatedRules.map((rule) => {
                      // Category colors (matching dashboard style)
                      const categoryColors = {
                        irdai: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20',
                        brand: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
                        seo: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
                        qualitative: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
                      };

                      const categoryBadgeColors = {
                        irdai: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
                        brand: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
                        seo: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
                        qualitative: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
                      };

                      // Severity colors
                      const severityBadgeColors = {
                        critical: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
                        high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
                        medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
                        low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
                      };

                      const categoryKey = rule.category.toLowerCase() as keyof typeof categoryColors;
                      const severityKey = rule.severity.toLowerCase() as keyof typeof severityBadgeColors;

                      return (
                        <motion.div
                          key={rule.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg bg-gradient-to-br ${categoryColors[categoryKey] || categoryColors.qualitative} border hover:shadow-lg transition-all`}
                        >
                          <p className="text-foreground font-medium mb-3">
                            {rule.rule_text}
                          </p>
                          <div className="flex gap-2">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${categoryBadgeColors[categoryKey] || categoryBadgeColors.qualitative}`}>
                              {rule.category.toUpperCase()}
                            </span>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${severityBadgeColors[severityKey] || severityBadgeColors.low}`}>
                              {rule.severity.toUpperCase()}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              onClick={handleBack}
              disabled={step === 1}
              variant="ghost"
              className="disabled:opacity-0 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading || isGeneratingRules}
                isLoading={loading || isGeneratingRules}
              >
                {loading || isGeneratingRules ? (
                  step === 3 ? 'Creating Project...' : 'Generating Rules...'
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                <Sparkles className="w-5 h-5" />
                Go to Project
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
