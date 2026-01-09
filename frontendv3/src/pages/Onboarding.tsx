import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  FileText,
  Headset,
  Mic,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { StackedCard } from "../components/ui/stacked-card";
import { Stepper } from "../components/ui/stepper";
import { Textarea } from "../components/ui/textarea";

// Industry options
const INDUSTRIES = [
  {
    value: "insurance",
    label: "Insurance",
    icon: "🛡️",
    description: "IRDAI regulations & guidelines",
  },
  {
    value: "healthcare",
    label: "Healthcare",
    icon: "⚕️",
    description: "HIPAA, FDA compliance",
  },
  {
    value: "finance",
    label: "Finance & Banking",
    icon: "💰",
    description: "SEBI, RBI regulations",
  },
  {
    value: "ecommerce",
    label: "E-Commerce",
    icon: "🛒",
    description: "Consumer protection laws",
  },
  {
    value: "technology",
    label: "Technology",
    icon: "💻",
    description: "GDPR, data privacy",
  },
  {
    value: "other",
    label: "Other",
    icon: "🏢",
    description: "General compliance",
  },
];

const AGENTS = [
  {
    id: "agent_compliance",
    name: "Regulatory Compliance",
    description: "Analyze marketing content & documents against IRDAI/Brand rules.",
    icon: ShieldCheck,
    required: true,
  },
  {
    id: "agent_voice",
    name: "Voice Audit",
    description: "Transcribe call recordings and detect sales mis-selling/violations.",
    icon: Mic,
    required: false,
  },
  {
    id: "agent_analytics",
    name: "BI Reasoning",
    description: "Executive narratives, trend detection, and anomaly analysis.",
    icon: BarChart3,
    required: false,
  },
  {
    id: "agent_sales",
    name: "Sales & Underwriting",
    description: "Bilingual sales bot (Eng/Hin) with real-time risk assessment.",
    icon: Headset,
    required: false,
  },
];

interface Rule {
  id: string;
  rule_text: string;
  category: string;
  severity: string;
  is_active: boolean;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    industry: "",
    brand_name: "",
    brand_guidelines: "",
    project_name: "",
    project_description: "",
    agent_voice: false,
    agent_compliance: true,
    agent_analytics: false,
    agent_sales: false,
  });

  // Project & Rules state
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedRules, setGeneratedRules] = useState<Rule[]>([]);
  const [isGeneratingRules, setIsGeneratingRules] = useState(false);

  const steps = [
    { label: "Industry", description: "Select your industry" },
    { label: "Brand", description: "Brand information" },
    { label: "Project", description: "Create project" },
    { label: "Agents", description: "Specialist agents" },
    { label: "Upload", description: "Add guidelines" },
    { label: "Review", description: "Review rules" },
  ];

  const handleNext = async () => {
    setError(null);

    // Step 4 -> 5: Create Project (Now after Agents selection)
    if (step === 4) {
      setLoading(true);
      try {
        const projectRes = await api.createProject({
          name: formData.project_name,
          description:
            formData.project_description ||
            `${formData.brand_name} - ${formData.industry} project`,
          agent_voice: formData.agent_voice,
          agent_compliance: formData.agent_compliance,
          agent_analytics: formData.agent_analytics,
          agent_sales: formData.agent_sales,
        } as any);

        setCreatedProjectId(projectRes.data.id);
        setStep(step + 1);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to create project");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 5 -> 6: Upload & Generate Rules
    if (step === 5 && uploadedFile && createdProjectId) {
      setIsGeneratingRules(true);
      setError(null);
      try {
        await api.uploadGuideline(createdProjectId, uploadedFile);

        // Fetch generated rules
        const userId =
          localStorage.getItem("userId") ||
          "550e8400-e29b-41d4-a716-446655440000";
        const rulesRes = await api.getRules({
          userId,
          page: 1,
          page_size: 100,
          is_active: true,
        });

        const projectRules = rulesRes.data.rules.filter(
          (rule: Rule) => rule.is_active
        );
        setGeneratedRules(projectRules);
        setStep(step + 1);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to upload guideline");
      } finally {
        setIsGeneratingRules(false);
      }
      return;
    }

    if (step < 6) {
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
    navigate("/projects");
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.industry !== "";
      case 2:
        return formData.brand_name.trim() !== "";
      case 3:
        return formData.project_name.trim() !== "";
      case 4:
        return true; // Agents step is always valid
      case 5:
        return uploadedFile !== null;
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">
              Adaptive Compliance Engine
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome! Let's Get Started
          </h1>
          <p className="text-lg text-muted-foreground">
            Set up your first project and compliance rules in just a few steps
          </p>
        </motion.div>

        {/* Stepper */}
        <Stepper steps={steps} currentStep={step} />

        {/* Main Card with Stacked Effect */}
        <StackedCard stackColor="bg-primary/10">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded"
            >
              <p className="text-destructive text-sm">{error}</p>
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
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Select Your Industry</h2>
                    <p className="text-muted-foreground">
                      We'll find relevant regulations for you
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry.value}
                      onClick={() =>
                        setFormData({ ...formData, industry: industry.value })
                      }
                      className={`p-6 rounded border-2 transition-all text-left ${
                        formData.industry === industry.value
                          ? "border-foreground bg-accent"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{industry.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">
                            {industry.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {industry.description}
                          </p>
                        </div>
                        {formData.industry === industry.value && (
                          <CheckCircle className="w-6 h-6 flex-shrink-0" />
                        )}
                      </div>
                    </button>
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
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      Tell Us About Your Brand
                    </h2>
                    <p className="text-muted-foreground">
                      This helps us tailor the analysis
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand_name">Brand Name *</Label>
                    <Input
                      id="brand_name"
                      value={formData.brand_name}
                      onChange={(e) =>
                        setFormData({ ...formData, brand_name: e.target.value })
                      }
                      placeholder="e.g., SecureLife Insurance"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand_guidelines">
                      Brand Guidelines (Optional)
                    </Label>
                    <Textarea
                      id="brand_guidelines"
                      value={formData.brand_guidelines}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brand_guidelines: e.target.value,
                        })
                      }
                      placeholder="Paste your brand guidelines here, or leave blank..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Adding guidelines helps generate more accurate brand
                      compliance rules
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Specialist Agents Selection */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Choose Specialized Agents</h2>
                    <p className="text-muted-foreground">
                      Power your project with AI specialists
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AGENTS.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() =>
                        !agent.required &&
                        setFormData({
                          ...formData,
                          [agent.id as keyof typeof formData]: !formData[agent.id as keyof typeof formData],
                        })
                      }
                      className={`p-6 rounded border-2 transition-all text-left relative ${
                        formData[agent.id as keyof typeof formData]
                          ? "border-foreground bg-accent/50"
                          : "border-border hover:border-foreground/30"
                      } ${agent.required ? "cursor-default opacity-80" : "cursor-pointer"}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded ${formData[agent.id as keyof typeof formData] ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <agent.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 flex items-center gap-2">
                            {agent.name}
                            {agent.required && (
                              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">Required</span>
                            )}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {agent.description}
                          </p>
                        </div>
                        {formData[agent.id as keyof typeof formData] && (
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Upload Guidelines */}
            {step === 5 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <Upload className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      Upload Your First Guideline
                    </h2>
                    <p className="text-muted-foreground">
                      We'll automatically extract compliance rules
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border-2 border-dashed border-border rounded p-8 text-center hover:border-foreground/50 transition-colors">
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
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="ml-4 p-2 text-destructive hover:bg-destructive/10 rounded"
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
                    <div className="p-4 bg-primary/10 border border-primary/50 rounded flex items-center gap-3">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                      <p className="text-sm text-primary">
                        Generating rules from your guideline... This may take
                        30-60 seconds.
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
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      Review & Modify Rules
                    </h2>
                    <p className="text-muted-foreground">
                      Generated {generatedRules.length} rules - Edit as needed
                    </p>
                  </div>
                </div>

                {generatedRules.length === 0 ? (
                  <div className="text-center py-12 bg-muted/50 rounded">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No rules generated yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generatedRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-4 rounded border border-border hover:shadow-sm transition-all"
                      >
                        <p className="font-medium mb-3">{rule.rule_text}</p>
                        <div className="flex gap-2">
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                            {rule.category.toUpperCase()}
                          </span>
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border">
                            {rule.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              onClick={handleBack}
              disabled={step === 1}
              variant="ghost"
              className="disabled:opacity-0 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            {step < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading || isGeneratingRules}
              >
                {loading || isGeneratingRules ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    {step === 3 ? "Creating Project..." : "Generating Rules..."}
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                <Sparkles className="w-5 h-5 mr-2" />
                Go to Project
              </Button>
            )}
          </div>
        </StackedCard>
      </div>
    </div>
  );
}
