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
  // Handle special step mappings
  const getDisplayIndex = () => {
    if (currentStep === 'creative-generation') return STEP_CONFIG.findIndex(s => s.id === 'creative-review');
    if (currentStep === 'publishing') return STEP_CONFIG.findIndex(s => s.id === 'campaign-preview');
    if (currentStep === 'published') return STEP_CONFIG.length; // All steps completed
    return STEP_CONFIG.findIndex(s => s.id === currentStep);
  };

  const displayIndex = getDisplayIndex();
  const isFullyCompleted = currentStep === 'published';

  return (
    <div className="px-6 py-4 border-b border-border bg-background">
      {/* Progress bar */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
          {isFullyCompleted ? 'Completed' : `Step ${Math.max(1, displayIndex + 1)} of ${STEP_CONFIG.length}`}
        </span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(Math.min(displayIndex + 1, STEP_CONFIG.length) / STEP_CONFIG.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step navigation pills - centered */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {STEP_CONFIG.map((step, index) => {
          const isCompleted = index < displayIndex;
          const isCurrent = index === displayIndex && !isFullyCompleted;
          const isClickable = isCompleted;
          const Icon = step.icon;
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              title={step.label}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                isCurrent && "bg-primary text-primary-foreground border-primary shadow-md",
                isCompleted && "bg-secondary/15 text-secondary border-secondary/30 hover:bg-secondary/25 cursor-pointer",
                !isCompleted && !isCurrent && "bg-muted/50 text-muted-foreground border-transparent"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
