import { ArrowRight, Sparkles, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { StackedCard } from "../components/ui/stacked-card";

export default function OnboardingChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">
              Welcome to Compliance Bot
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            How would you like to get started?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your path to compliance excellence
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Option 1: Quick Start */}
          <StackedCard
            stackColor="bg-primary/20"
            interactive
            onClick={() => navigate("/projects")}
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Quick Start</h2>
                <p className="text-muted-foreground">
                  Jump straight to projects and set up custom compliance rules
                  manually
                </p>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Create projects instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Upload your own guidelines</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Full control over rules</span>
                </li>
              </ul>

              <Button className="w-full" size="lg">
                Take Me to Projects
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </StackedCard>

          {/* Option 2: Guided Onboarding */}
          <StackedCard
            stackColor="bg-accent"
            interactive
            onClick={() => navigate("/onboarding/flow")}
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded bg-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Guided Setup</h2>
                <p className="text-muted-foreground">
                  Let our AI search and create industry-specific compliance
                  rules for you
                </p>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5" />
                  <span>AI-powered rule generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5" />
                  <span>Industry-specific regulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5" />
                  <span>Automated compliance setup</span>
                </li>
              </ul>

              <Button className="w-full" size="lg" variant="outline">
                Start Guided Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </StackedCard>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            You can always switch between manual and AI-assisted modes later
          </p>
        </div>
      </div>
    </div>
  );
}
