import { useState } from 'react';
import { AIRecommendation, PublishedCampaign } from '@/types/campaign';
import { Sparkles, AlertCircle, Info, ChevronRight, Check, X, TrendingUp, Copy, Play, Pause, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InlineRecommendationsProps {
  recommendations: AIRecommendation[];
  campaigns: PublishedCampaign[];
  onAction: (recommendationId: string, action: string, value?: number) => void;
  onCloneCreative?: (recommendation: AIRecommendation) => void;
}

// Priority badge component
const PriorityBadge = ({ priority }: { priority: AIRecommendation['priority'] }) => {
  const config = {
    high: { label: 'High Priority', variant: 'destructive' as const, icon: AlertCircle },
    medium: { label: 'Medium', variant: 'secondary' as const, icon: null },
    suggestion: { label: 'Tip', variant: 'outline' as const, icon: Info }
  };

  const { label, variant, icon: Icon } = config[priority];

  return (
    <Badge variant={variant} className="text-[10px] px-1.5 py-0 h-5">
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
};

// Type icon component
const TypeIcon = ({ type }: { type: AIRecommendation['type'] }) => {
  const icons = {
    'budget-increase': TrendingUp,
    'budget-decrease': DollarSign,
    'pause-creative': Pause,
    'resume-campaign': Play,
    'clone-creative': Copy
  };
  const Icon = icons[type];
  return <Icon className="h-4 w-4" />;
};

// Individual recommendation card
const RecommendationCard = ({ 
  recommendation, 
  onAction,
  onCloneCreative 
}: { 
  recommendation: AIRecommendation; 
  onAction: (recommendationId: string, action: string, value?: number) => void;
  onCloneCreative?: (recommendation: AIRecommendation) => void;
}) => {
  const [customBudget, setCustomBudget] = useState(recommendation.recommendedValue || 0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickAction = async () => {
    setIsProcessing(true);
    
    // Determine the quick action based on type
    switch (recommendation.type) {
      case 'budget-increase':
      case 'budget-decrease':
        onAction(recommendation.id, 'apply', recommendation.recommendedValue);
        toast.success(`Budget updated to $${recommendation.recommendedValue}/day`);
        break;
      case 'pause-creative':
        onAction(recommendation.id, 'pause');
        toast.success('Creative paused successfully');
        break;
      case 'resume-campaign':
        onAction(recommendation.id, 'resume', recommendation.recommendedValue);
        toast.success('Campaign resumed');
        break;
      case 'clone-creative':
        if (onCloneCreative) {
          onCloneCreative(recommendation);
        } else {
          onAction(recommendation.id, 'clone');
          toast.success('Creative cloning started - new campaign will be created');
        }
        break;
    }
    
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleDismiss = () => {
    onAction(recommendation.id, 'dismiss');
    toast.info('Recommendation dismissed');
  };

  const getQuickActionLabel = () => {
    switch (recommendation.type) {
      case 'budget-increase':
        return `Apply $${recommendation.recommendedValue}/day`;
      case 'budget-decrease':
        return `Reduce to $${recommendation.recommendedValue}/day`;
      case 'pause-creative':
        return 'Pause Creative';
      case 'resume-campaign':
        return 'Resume Campaign';
      case 'clone-creative':
        return 'Clone to New Campaign';
    }
  };

  return (
    <div className={cn(
      "glass-card p-4 rounded-xl animate-fade-in transition-all",
      recommendation.priority === 'high' && "border-destructive/30 bg-destructive/5"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            recommendation.priority === 'high' ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
          )}>
            <TypeIcon type={recommendation.type} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <PriorityBadge priority={recommendation.priority} />
              <span className="text-xs text-muted-foreground">{recommendation.campaignName}</span>
            </div>
            <h4 className="text-sm font-semibold text-foreground">{recommendation.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{recommendation.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Creative preview for creative-related recommendations */}
      {recommendation.creative && (
        <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-muted/30">
          <img 
            src={recommendation.creative.thumbnail} 
            alt={recommendation.creative.name}
            className="w-12 h-12 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{recommendation.creative.name}</p>
            <div className="flex gap-3 mt-1">
              {recommendation.creative.metrics.slice(0, 3).map((m, i) => (
                <span key={i} className="text-[10px] text-muted-foreground">
                  {m.label}: <span className="font-medium text-foreground">{m.value}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budget slider for budget recommendations */}
      {(recommendation.type === 'budget-increase' || recommendation.type === 'budget-decrease') && (
        <div className="mb-3 p-2 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Current: ${recommendation.currentValue}/day</span>
            <span className="text-primary font-medium">New: ${customBudget}/day</span>
          </div>
          <Slider
            value={[customBudget]}
            onValueChange={(v) => setCustomBudget(v[0])}
            min={recommendation.type === 'budget-decrease' ? 10 : recommendation.currentValue || 10}
            max={recommendation.type === 'budget-increase' ? (recommendation.recommendedValue || 50) * 1.5 : recommendation.currentValue || 100}
            step={5}
            className="w-full"
          />
        </div>
      )}

      {/* Projected impact */}
      {recommendation.projectedImpact && recommendation.projectedImpact.length > 0 && (
        <div className="flex gap-4 mb-3">
          {recommendation.projectedImpact.slice(0, 3).map((impact, i) => (
            <div key={i} className="text-center">
              <p className="text-[10px] text-muted-foreground">{impact.label}</p>
              <p className="text-xs font-semibold text-secondary">{impact.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          onClick={handleQuickAction}
          disabled={isProcessing}
          className="flex-1 h-8 text-xs"
        >
          {isProcessing ? (
            <span className="flex items-center gap-1">
              <span className="animate-spin">⏳</span> Applying...
            </span>
          ) : (
            <>
              <Check className="h-3 w-3 mr-1" />
              {getQuickActionLabel()}
            </>
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDismiss}
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export const InlineRecommendations = ({ 
  recommendations, 
  campaigns, 
  onAction,
  onCloneCreative 
}: InlineRecommendationsProps) => {
  const highPriority = recommendations.filter(r => r.priority === 'high').length;

  if (recommendations.length === 0) {
    return (
      <div className="p-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="font-medium text-foreground">All optimized!</p>
              <p className="text-sm text-muted-foreground">No recommendations right now</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            highPriority > 0 ? "bg-destructive/20 animate-pulse" : "bg-secondary/20"
          )}>
            <Sparkles className={cn(
              "h-4 w-4",
              highPriority > 0 ? "text-destructive" : "text-secondary"
            )} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
            <p className="text-xs text-muted-foreground">
              {recommendations.length} action{recommendations.length !== 1 ? 's' : ''} to improve performance
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {recommendations.map((rec) => (
          <RecommendationCard 
            key={rec.id} 
            recommendation={rec} 
            onAction={onAction}
            onCloneCreative={onCloneCreative}
          />
        ))}
      </div>
    </div>
  );
};
