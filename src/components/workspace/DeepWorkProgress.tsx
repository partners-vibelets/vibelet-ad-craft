import { useState, useEffect, useRef } from 'react';
import { Check, Sparkles, Brain, Zap, Palette, Film, Wand2, Eye, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export interface DeepWorkStep {
  id: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  durationMs: number;
}

interface DeepWorkProgressProps {
  steps: DeepWorkStep[];
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
  funFacts?: string[];
}

const DEFAULT_FUN_FACTS = [
  "AI models work best when they take their time ☕",
  "Fun fact: The average Facebook user sees 1,500 posts per day — your ad needs to stand out",
  "Video ads get 2x more engagement than static images on Meta",
  "Did you know? Ads with human faces get 38% more engagement",
  "The first 3 seconds of a video ad determine 70% of its success",
  "Meta's algorithm needs ~50 conversions per week per ad set for optimal learning",
  "Carousel ads drive 72% higher click-through rates than single image ads",
  "Almost there — polishing the final touches... ✨",
];

export const DeepWorkProgress = ({
  steps,
  title = "AI is working...",
  subtitle = "This usually takes 30-60 seconds",
  onComplete,
  funFacts = DEFAULT_FUN_FACTS,
}: DeepWorkProgressProps) => {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const [factVisible, setFactVisible] = useState(true);
  const completedRef = useRef(false);

  // Auto-advance steps
  useEffect(() => {
    if (activeStepIdx >= steps.length) return;
    const step = steps[activeStepIdx];
    const timer = setTimeout(() => {
      setCompletedSteps(prev => new Set([...prev, activeStepIdx]));
      if (activeStepIdx < steps.length - 1) {
        setActiveStepIdx(prev => prev + 1);
      } else if (!completedRef.current) {
        completedRef.current = true;
        setTimeout(() => onComplete?.(), 800);
      }
    }, step.durationMs);
    return () => clearTimeout(timer);
  }, [activeStepIdx, steps, onComplete]);

  // Progress bar
  useEffect(() => {
    const totalDuration = steps.reduce((s, st) => s + st.durationMs, 0);
    let elapsed = 0;
    for (let i = 0; i < activeStepIdx; i++) elapsed += steps[i].durationMs;
    const base = (elapsed / totalDuration) * 100;
    const current = steps[activeStepIdx]?.durationMs || 1;
    const interval = setInterval(() => {
      setOverallProgress(prev => {
        const max = base + (current / totalDuration) * 100;
        const next = prev + 0.5;
        return Math.min(next, max, 100);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [activeStepIdx, steps]);

  // Rotate fun facts
  useEffect(() => {
    const interval = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setCurrentFact(prev => (prev + 1) % funFacts.length);
        setFactVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [funFacts]);

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 py-10 bg-background">
      {/* Pulsing brain animation */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
        </div>
        <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center animate-bounce" style={{ animationDelay: '300ms' }}>
          <Zap className="w-3 h-3 text-primary" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>

      {/* Overall progress */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span className="tabular-nums font-medium">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Step timeline */}
      <div className="w-full max-w-sm space-y-1 mb-10">
        {steps.map((step, i) => {
          const isCompleted = completedSteps.has(i);
          const isActive = i === activeStepIdx && !isCompleted;
          const isPending = i > activeStepIdx;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500",
                isActive && "bg-primary/5 border border-primary/20",
                isCompleted && "opacity-70",
                isPending && "opacity-40",
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Status icon */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500",
                isCompleted && "bg-secondary/15",
                isActive && "bg-primary/15 animate-pulse",
                isPending && "bg-muted/50",
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4 text-secondary" />
                ) : (
                  <span className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground/50",
                  )}>
                    {step.icon}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate transition-colors",
                  isCompleted ? "text-muted-foreground line-through" : isActive ? "text-foreground" : "text-muted-foreground/60",
                )}>
                  {step.label}
                </p>
                {step.sublabel && isActive && (
                  <p className="text-xs text-muted-foreground mt-0.5 animate-fade-in">{step.sublabel}</p>
                )}
              </div>

              {/* Duration / status */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Fun facts carousel */}
      <div className="w-full max-w-md text-center min-h-[48px]">
        <p className={cn(
          "text-xs text-muted-foreground/70 italic transition-all duration-400",
          factVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        )}>
          💡 {funFacts[currentFact]}
        </p>
      </div>
    </div>
  );
};

// Pre-built step configurations
export const CREATIVE_GENERATION_STEPS: DeepWorkStep[] = [
  { id: 'analyze', icon: <Eye className="w-4 h-4" />, label: 'Analyzing your product...', sublabel: 'Understanding features, audience, and positioning', durationMs: 2500 },
  { id: 'angles', icon: <Wand2 className="w-4 h-4" />, label: 'Selecting best creative angles', sublabel: 'Based on Meta best practices for your category', durationMs: 2000 },
  { id: 'render', icon: <Film className="w-4 h-4" />, label: 'Rendering video frames...', sublabel: 'AI avatar + product shots + motion graphics', durationMs: 3500 },
  { id: 'brand', icon: <Palette className="w-4 h-4" />, label: 'Applying brand colors & style', sublabel: 'Matching your visual identity', durationMs: 1500 },
  { id: 'polish', icon: <Sparkles className="w-4 h-4" />, label: 'Final polish & optimization', sublabel: 'Ensuring platform compliance & quality', durationMs: 2000 },
];

export const CAMPAIGN_CONFIG_STEPS: DeepWorkStep[] = [
  { id: 'structure', icon: <Zap className="w-4 h-4" />, label: 'Building campaign structure...', sublabel: 'Campaigns, ad sets, and ads per your strategy', durationMs: 2000 },
  { id: 'targeting', icon: <Eye className="w-4 h-4" />, label: 'Configuring targeting & placements', sublabel: 'Audience, locations, and platform placements', durationMs: 1500 },
  { id: 'assign', icon: <Upload className="w-4 h-4" />, label: 'Assigning creatives to ads', sublabel: 'Matching best creative to each ad slot', durationMs: 2000 },
  { id: 'tracking', icon: <Wand2 className="w-4 h-4" />, label: 'Setting up tracking & pixels', sublabel: 'Conversion events, UTM parameters', durationMs: 1500 },
  { id: 'review', icon: <Check className="w-4 h-4" />, label: 'Final review & compliance check', sublabel: 'Meta policy validation', durationMs: 1500 },
];
