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
    if (currentStep === 'publishing' || currentStep === 'published') return STEP_CONFIG.findIndex(s => s.id === 'campaign-preview');
    return STEP_CONFIG.findIndex(s => s.id === currentStep);
  };

  const displayIndex = getDisplayIndex();

  return (
    <div className="px-6 py-3 border-b border-border bg-muted/20">
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-medium text-foreground whitespace-nowrap">
          Step {Math.max(1, displayIndex + 1)} of {STEP_CONFIG.length}
        </span>
        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((displayIndex + 1) / STEP_CONFIG.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Horizontal step navigation */}
      <div className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
              title={step.label}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                isCurrent && "bg-primary text-primary-foreground shadow-sm",
                isCompleted && "bg-accent/50 text-accent-foreground hover:bg-accent cursor-pointer",
                !isCompleted && !isCurrent && "text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
