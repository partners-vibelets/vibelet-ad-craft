import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  BarChart3, 
  Lightbulb, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface LoadingStep {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  duration: number; // ms
}

const steps: LoadingStep[] = [
  {
    id: 'fetching',
    label: 'Connecting to your ad account',
    sublabel: 'Fetching campaigns, ad sets, and ads...',
    icon: <Search className="w-6 h-6" />,
    duration: 2000,
  },
  {
    id: 'analyzing',
    label: 'Analyzing your spend patterns',
    sublabel: 'Reviewing 30 days of performance data...',
    icon: <BarChart3 className="w-6 h-6" />,
    duration: 2500,
  },
  {
    id: 'finding',
    label: 'Finding opportunities',
    sublabel: 'Identifying what\'s working and what\'s not...',
    icon: <Lightbulb className="w-6 h-6" />,
    duration: 2000,
  },
  {
    id: 'complete',
    label: 'Audit complete!',
    sublabel: 'We found 5 key insights for you',
    icon: <CheckCircle2 className="w-6 h-6" />,
    duration: 1000,
  },
];

interface LoadingExperienceProps {
  onComplete: () => void;
}

export const LoadingExperience = ({ onComplete }: LoadingExperienceProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      onComplete();
      return;
    }

    const currentStep = steps[currentStepIndex];
    const progressInterval = 50; // Update every 50ms
    const progressIncrement = (progressInterval / currentStep.duration) * 100;

    const timer = setInterval(() => {
      setStepProgress((prev) => {
        const next = prev + progressIncrement;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setCurrentStepIndex((idx) => idx + 1);
            setStepProgress(0);
          }, 200);
          return 100;
        }
        return next;
      });
    }, progressInterval);

    return () => clearInterval(timer);
  }, [currentStepIndex, onComplete]);

  const currentStep = steps[currentStepIndex] || steps[steps.length - 1];
  const isComplete = currentStepIndex >= steps.length - 1 && stepProgress >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-6">
        {/* Main Content */}
        <div className="text-center mb-12">
          <div className={cn(
            "inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-500",
            isComplete 
              ? "bg-emerald-500/20 text-emerald-400" 
              : "bg-primary/20 text-primary"
          )}>
            {isComplete ? (
              <Sparkles className="w-10 h-10 animate-pulse" />
            ) : (
              <div className="animate-pulse">
                {currentStep.icon}
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {currentStep.label}
          </h2>
          <p className="text-muted-foreground">
            {currentStep.sublabel}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div 
                key={step.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                  isActive && "bg-primary/5 border-primary/30 scale-[1.02]",
                  isCompleted && "bg-emerald-500/5 border-emerald-500/20",
                  isPending && "bg-muted/30 border-border/30 opacity-50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                  isActive && "bg-primary/20 text-primary",
                  isCompleted && "bg-emerald-500/20 text-emerald-400",
                  isPending && "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm font-medium",
                      isActive && "text-foreground",
                      isCompleted && "text-emerald-400",
                      isPending && "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="text-xs text-primary font-medium">
                        {Math.round(stepProgress)}%
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs text-emerald-400 font-medium">
                        Done
                      </span>
                    )}
                  </div>
                  
                  {isActive && (
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${stepProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
