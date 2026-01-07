import { CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Steps */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all",
                    isCompleted &&
                      "bg-foreground text-background border-foreground",
                    isCurrent &&
                      "bg-background text-foreground border-foreground scale-110",
                    isUpcoming &&
                      "bg-background text-muted-foreground border-border"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2">
                  <div
                    className={cn(
                      "h-full transition-all",
                      isCompleted ? "bg-foreground" : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step labels */}
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={index}
              className={cn(
                "flex-1 text-center px-2",
                index === 0 && "text-left",
                index === steps.length - 1 && "text-right"
              )}
            >
              <p
                className={cn(
                  "text-xs font-medium transition-colors",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
