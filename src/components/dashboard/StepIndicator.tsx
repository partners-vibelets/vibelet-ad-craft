import { CampaignStep, StepInfo } from '@/types/campaign';
import { cn } from '@/lib/utils';
import { Check, Link, FileText, User, Video, Image, Settings, Share2, Building, Eye, Rocket, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEP_CONFIG: { id: CampaignStep; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { id: 'product-analysis', label: 'Product Analysis', shortLabel: 'Product', icon: Link },
  { id: 'script-selection', label: 'Script Selection', shortLabel: 'Script', icon: FileText },
  { id: 'avatar-selection', label: 'Avatar Selection', shortLabel: 'Avatar', icon: User },
  { id: 'creative-review', label: 'Creative Review', shortLabel: 'Creative', icon: Image },
  { id: 'campaign-setup', label: 'Campaign Setup', shortLabel: 'Setup', icon: Settings },
  { id: 'facebook-integration', label: 'Facebook Connect', shortLabel: 'Connect', icon: Share2 },
  { id: 'ad-account-selection', label: 'Ad Account', shortLabel: 'Account', icon: Building },
  { id: 'campaign-preview', label: 'Preview & Publish', shortLabel: 'Publish', icon: Rocket },
];

interface StepIndicatorProps {
  currentStep: CampaignStep;
  onStepClick: (step: CampaignStep) => void;
}

export const StepIndicator = ({ currentStep, onStepClick }: StepIndicatorProps) => {
  const currentIndex = STEP_CONFIG.findIndex(s => s.id === currentStep);
  const isWelcome = currentStep === 'welcome' || currentStep === 'product-url';
  
  if (isWelcome) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-muted/30 overflow-x-auto">
      {STEP_CONFIG.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = step.id === currentStep || 
          (currentStep === 'creative-generation' && step.id === 'creative-review') ||
          (currentStep === 'publishing' && step.id === 'campaign-preview') ||
          (currentStep === 'published' && step.id === 'campaign-preview');
        const isClickable = isCompleted;
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all",
                isCurrent && "bg-primary text-primary-foreground",
                isCompleted && !isCurrent && "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer",
                !isCompleted && !isCurrent && "text-muted-foreground opacity-50"
              )}
            >
              {isCompleted && !isCurrent ? (
                <Check className="w-3 h-3" />
              ) : (
                <Icon className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">{step.shortLabel}</span>
            </button>
            {index < STEP_CONFIG.length - 1 && (
              <div className={cn(
                "w-4 h-px mx-1",
                index < currentIndex ? "bg-primary/50" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};
