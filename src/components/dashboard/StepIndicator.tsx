import { CampaignStep } from '@/types/campaign';
import { cn } from '@/lib/utils';
import { Check, Link, FileText, User, Image, Settings, Share2, Building, Rocket } from 'lucide-react';

const STEP_CONFIG: { id: CampaignStep; label: string; icon: React.ElementType }[] = [
  { id: 'product-analysis', label: 'Product', icon: Link },
  { id: 'script-selection', label: 'Script', icon: FileText },
  { id: 'avatar-selection', label: 'Avatar', icon: User },
  { id: 'creative-review', label: 'Creative', icon: Image },
  { id: 'campaign-setup', label: 'Setup', icon: Settings },
  { id: 'facebook-integration', label: 'Connect', icon: Share2 },
  { id: 'ad-account-selection', label: 'Account', icon: Building },
  { id: 'campaign-preview', label: 'Publish', icon: Rocket },
];

interface StepIndicatorProps {
  currentStep: CampaignStep;
  onStepClick: (step: CampaignStep) => void;
}

export const StepIndicator = ({ currentStep, onStepClick }: StepIndicatorProps) => {
  const currentIndex = STEP_CONFIG.findIndex(s => s.id === currentStep);

  // Handle special step mappings
  const getDisplayIndex = () => {
    if (currentStep === 'creative-generation') return STEP_CONFIG.findIndex(s => s.id === 'creative-review');
    if (currentStep === 'publishing' || currentStep === 'published') return STEP_CONFIG.findIndex(s => s.id === 'campaign-preview');
    return currentIndex;
  };

  const displayIndex = getDisplayIndex();

  return (
    <div className="px-6 py-4 border-b border-border bg-muted/30">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-muted-foreground">
          Step {Math.max(1, displayIndex + 1)} of {STEP_CONFIG.length}
        </span>
        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((displayIndex + 1) / STEP_CONFIG.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step pills */}
      <div className="flex flex-wrap gap-1.5">
        {STEP_CONFIG.map((step, index) => {
          const isCompleted = index < displayIndex;
          const isCurrent = index === displayIndex;
          const isClickable = isCompleted;
          const Icon = step.icon;
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                isCurrent && "bg-primary text-primary-foreground",
                isCompleted && "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-3 h-3" />
              ) : (
                <Icon className="w-3 h-3" />
              )}
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
