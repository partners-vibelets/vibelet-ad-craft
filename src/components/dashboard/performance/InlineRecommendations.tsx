import { useState } from 'react';
import { AIRecommendation, PublishedCampaign } from '@/types/campaign';
import { Sparkles, Info, Check, X, TrendingUp, Copy, Play, Pause, DollarSign, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InlineRecommendationsProps {
  recommendations: AIRecommendation[];
  campaigns: PublishedCampaign[];
  onAction: (recommendationId: string, action: string, value?: number) => void;
  onCloneCreative?: (recommendation: AIRecommendation) => void;
}

// Priority badge component - using amber for high priority instead of red
const PriorityBadge = ({ priority }: { priority: AIRecommendation['priority'] }) => {
  const config = {
    high: { label: 'Urgent', className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
    medium: { label: 'Medium', className: 'bg-primary/20 text-primary border-primary/30' },
    suggestion: { label: 'Tip', className: 'bg-muted text-muted-foreground border-border' }
  };

  const { label, className } = config[priority];

  return (
    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", className)}>
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

// Individual recommendation card - compact for 2x2 grid
const RecommendationCard = ({ 
  recommendation, 
  onAction,
  onCloneCreative,
  isExpanded = false
}: { 
  recommendation: AIRecommendation; 
  onAction: (recommendationId: string, action: string, value?: number) => void;
  onCloneCreative?: (recommendation: AIRecommendation) => void;
  isExpanded?: boolean;
}) => {
  const [customBudget, setCustomBudget] = useState(recommendation.recommendedValue || 0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isBudgetRecommendation = recommendation.type === 'budget-increase' || recommendation.type === 'budget-decrease';

  const handleQuickAction = async (budgetValue?: number) => {
    setIsProcessing(true);
    const valueToApply = budgetValue ?? customBudget;
    
    switch (recommendation.type) {
      case 'budget-increase':
      case 'budget-decrease':
        onAction(recommendation.id, 'apply', valueToApply);
        toast.success(`Budget updated to $${valueToApply}/day`);
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

  const handleCustomBudgetApply = () => {
    const value = parseFloat(customInputValue);
    if (!isNaN(value) && value > 0) {
      handleQuickAction(value);
      setShowCustomInput(false);
      setCustomInputValue('');
    } else {
      toast.error('Please enter a valid budget amount');
    }
  };

  const handleDismiss = () => {
    onAction(recommendation.id, 'dismiss');
    toast.info('Recommendation dismissed');
  };

  const getQuickActionLabel = () => {
    switch (recommendation.type) {
      case 'budget-increase':
        return `$${recommendation.recommendedValue}/day`;
      case 'budget-decrease':
        return `$${recommendation.recommendedValue}/day`;
      case 'pause-creative':
        return 'Pause';
      case 'resume-campaign':
        return 'Resume';
      case 'clone-creative':
        return 'Clone';
    }
  };

  return (
    <div className={cn(
      "glass-card p-3 rounded-xl animate-fade-in transition-all h-full flex flex-col",
      recommendation.priority === 'high' && "border-amber-500/30 bg-amber-500/5"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
            recommendation.priority === 'high' ? "bg-amber-500/20 text-amber-600" : "bg-primary/20 text-primary"
          )}>
            <TypeIcon type={recommendation.type} />
          </div>
          <PriorityBadge priority={recommendation.priority} />
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDismiss}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <p className="text-xs text-muted-foreground mb-1 truncate">{recommendation.campaignName}</p>
        <h4 className={cn(
          "text-sm font-semibold text-foreground",
          isExpanded ? "" : "line-clamp-1"
        )}>{recommendation.title}</h4>
        <p className={cn(
          "text-xs text-muted-foreground mt-1",
          isExpanded ? "" : "line-clamp-2"
        )}>{recommendation.reasoning}</p>
      </div>

      {/* Creative preview for creative-related recommendations */}
      {recommendation.creative && (
        <div className="flex items-center gap-2 my-2 p-2 rounded-lg bg-muted/30">
          <img 
            src={recommendation.creative.thumbnail} 
            alt={recommendation.creative.name}
            className="w-10 h-10 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{recommendation.creative.name}</p>
          </div>
        </div>
      )}

      {/* Budget controls for budget recommendations */}
      {isBudgetRecommendation && (
        <div className="my-2 p-2 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">Current: ${recommendation.currentValue}/day</span>
          </div>
          {showCustomInput ? (
            <div className="flex items-center gap-1 mt-2">
              <Input
                type="number"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder="Enter amount"
                className="h-7 text-xs"
              />
              <Button size="sm" className="h-7 px-2" onClick={handleCustomBudgetApply}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowCustomInput(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Slider
              value={[customBudget]}
              onValueChange={(v) => setCustomBudget(v[0])}
              min={10}
              max={Math.max((recommendation.recommendedValue || 50) * 2, 200)}
              step={5}
              className="w-full mt-1"
            />
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1 mt-2">
        <Button 
          size="sm" 
          onClick={() => handleQuickAction()}
          disabled={isProcessing}
          className="flex-1 h-7 text-xs"
        >
          {isProcessing ? (
            <span className="flex items-center gap-1">Applying...</span>
          ) : (
            <>
              <Check className="h-3 w-3 mr-1" />
              {getQuickActionLabel()}
            </>
          )}
        </Button>
        {isBudgetRecommendation && !showCustomInput && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCustomInput(true)}
            className="h-7 text-xs px-2"
          >
            Custom
          </Button>
        )}
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
  const [isExpanded, setIsExpanded] = useState(false);

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
    <>
      <div className="p-4">
        {/* Header with expand button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
              <p className="text-xs text-muted-foreground">
                {recommendations.length} action{recommendations.length !== 1 ? 's' : ''} to improve performance
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* 2x2 Grid of recommendations - free flowing, no scroll constraint */}
        <div className="grid grid-cols-2 gap-3">
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

      {/* Expanded Dialog View */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span>AI Recommendations</span>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  {recommendations.length} action{recommendations.length !== 1 ? 's' : ''} to improve performance
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <RecommendationCard 
                  key={rec.id} 
                  recommendation={rec} 
                  onAction={(id, action, value) => {
                    onAction(id, action, value);
                  }}
                  onCloneCreative={onCloneCreative}
                  isExpanded
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};