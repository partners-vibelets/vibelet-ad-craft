import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIRecommendation, PublishedCampaign, RecommendationLevel } from '@/types/campaign';
import { Sparkles, Check, X, TrendingUp, Copy, Play, Pause, DollarSign, ExternalLink, ThumbsUp, ThumbsDown, Clock, Layers, Target, Image, Megaphone, Filter, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RecommendationRating } from './RecommendationRating';
import { formatNotificationTime } from '@/lib/timeUtils';

interface InlineRecommendationsProps {
  recommendations: AIRecommendation[];
  campaigns: PublishedCampaign[];
  onAction: (recommendationId: string, action: string, value?: number) => void;
  onCloneCreative?: (recommendation: AIRecommendation) => void;
}

// Action state type for tracking user decisions
type ActionState = 'pending' | 'accepted' | 'dismissed' | 'deferred';

// Priority badge component - using amber for high priority, muted for others
const PriorityBadge = ({ priority }: { priority: AIRecommendation['priority'] }) => {
  const config = {
    high: { label: 'Urgent', className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
    medium: { label: 'Medium', className: 'bg-muted text-muted-foreground border-border' },
    suggestion: { label: 'Tip', className: 'bg-muted text-muted-foreground border-border' }
  };

  const { label, className } = config[priority];

  return (
    <Badge variant="outline" className={cn("text-xs px-2 py-0.5 h-6", className)}>
      {label}
    </Badge>
  );
};

// Level badge component to show what level the recommendation applies to
const LevelBadge = ({ level }: { level: RecommendationLevel }) => {
  const config = {
    campaign: { label: 'Campaign', icon: Megaphone, className: 'bg-primary/10 text-primary border-primary/20' },
    adset: { label: 'Ad Set', icon: Target, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    ad: { label: 'Ad', icon: Layers, className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    creative: { label: 'Creative', icon: Image, className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' }
  };

  const { label, icon: Icon, className } = config[level];

  return (
    <Badge variant="outline" className={cn("text-xs px-2 py-0.5 h-6 gap-1", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

// Confidence score indicator
const ConfidenceScore = ({ score }: { score: number }) => {
  const getColor = () => {
    if (score >= 85) return 'text-secondary';
    if (score >= 70) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex items-center gap-2">
      <Progress value={score} className="h-1.5 w-16" />
      <span className={cn("text-xs font-medium", getColor())}>{score}%</span>
    </div>
  );
};

// Action state badge to show user's decision
const ActionStateBadge = ({ state }: { state: ActionState }) => {
  if (state === 'pending') return null;
  
  const config = {
    accepted: { label: 'Applied', icon: ThumbsUp, className: 'bg-secondary/20 text-secondary border-secondary/30' },
    dismissed: { label: 'Skipped', icon: ThumbsDown, className: 'bg-muted text-muted-foreground border-border' },
    deferred: { label: 'Later', icon: Clock, className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' }
  };

  const { label, icon: Icon, className } = config[state];

  return (
    <Badge variant="outline" className={cn("text-xs px-2 py-0.5 h-6 gap-1", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

// Type icon component - using muted colors
const TypeIcon = ({ type, priority }: { type: AIRecommendation['type']; priority: AIRecommendation['priority'] }) => {
  const icons = {
    'budget-increase': TrendingUp,
    'budget-decrease': DollarSign,
    'pause-creative': Pause,
    'resume-campaign': Play,
    'clone-creative': Copy
  };
  const Icon = icons[type];
  const isUrgent = priority === 'high';
  
  return (
    <div className={cn(
      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
      isUrgent ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground"
    )}>
      <Icon className="h-4 w-4" />
    </div>
  );
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
  const [actionState, setActionState] = useState<ActionState>('pending');

  const isBudgetRecommendation = recommendation.type === 'budget-increase' || recommendation.type === 'budget-decrease';

  const handleQuickAction = async (budgetValue?: number) => {
    setIsProcessing(true);
    const valueToApply = budgetValue ?? (showCustomInput ? parseFloat(customInputValue) : recommendation.recommendedValue);
    
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
    
    setActionState('accepted');
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
    setActionState('dismissed');
    toast.info('Recommendation skipped');
  };

  const getQuickActionLabel = () => {
    if (showCustomInput && isBudgetRecommendation) {
      return 'Apply';
    }
    
    switch (recommendation.type) {
      case 'budget-increase':
      case 'budget-decrease':
        return `Apply $${recommendation.recommendedValue}`;
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
      "glass-card p-4 rounded-xl transition-all duration-300 h-full flex flex-col cursor-pointer",
      "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:scale-[1.02]",
      recommendation.priority === 'high' && "border-amber-500/30 bg-amber-500/5",
      actionState !== 'pending' && "opacity-60 hover:scale-100"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeIcon type={recommendation.type} priority={recommendation.priority} />
          <PriorityBadge priority={recommendation.priority} />
          <LevelBadge level={recommendation.level} />
          <ActionStateBadge state={actionState} />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            disabled={actionState !== 'pending'}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatNotificationTime(recommendation.createdAt)}
          </span>
        </div>
      </div>

      {/* Campaign name */}
      <p className="text-xs text-primary font-medium mb-1 truncate">{recommendation.campaignName}</p>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <h4 className={cn(
          "text-sm font-semibold text-foreground leading-snug",
          isExpanded ? "" : "line-clamp-2"
        )}>{recommendation.title}</h4>
        <p className={cn(
          "text-sm text-muted-foreground mt-1 leading-relaxed",
          isExpanded ? "" : "line-clamp-3"
        )}>{recommendation.reasoning}</p>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center gap-2 my-2">
        <span className="text-xs text-muted-foreground">Confidence:</span>
        <ConfidenceScore score={recommendation.confidenceScore} />
      </div>

      {/* Creative preview for creative-related recommendations */}
      {recommendation.creative && (
        <div className="flex items-center gap-3 my-2 p-2 rounded-lg bg-muted/30">
          <img 
            src={recommendation.creative.thumbnail} 
            alt={recommendation.creative.name}
            className="w-10 h-10 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{recommendation.creative.name}</p>
          </div>
        </div>
      )}

      {/* Budget controls for budget recommendations */}
      {isBudgetRecommendation && (
        <div className="my-2 p-3 rounded-lg bg-muted/30">
          {showCustomInput ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder="Amount"
                className="h-8 text-sm px-3 flex-1"
                disabled={actionState !== 'pending'}
              />
              <Button size="sm" variant="secondary" className="h-8 px-3 text-sm" onClick={handleCustomBudgetApply} disabled={actionState !== 'pending'}>
                <Check className="h-3.5 w-3.5 mr-1" />
                Apply
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowCustomInput(false)} disabled={actionState !== 'pending'}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">${recommendation.currentValue}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-semibold text-secondary">${recommendation.recommendedValue}</span>
                <span className="text-xs text-muted-foreground">/day</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-secondary">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+{Math.round(((recommendation.recommendedValue || 0) - (recommendation.currentValue || 0)) / (recommendation.currentValue || 1) * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons - bottom-right aligned, using primary color */}
      {actionState === 'pending' && (
        <div className="flex items-center justify-end gap-2 mt-auto pt-3">
          {isBudgetRecommendation && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="h-9 text-sm px-3 text-muted-foreground"
            >
              {showCustomInput ? 'AI Pick' : 'Custom'}
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={() => handleQuickAction()}
            disabled={isProcessing}
            className="h-9 text-sm px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isProcessing ? (
              <span>...</span>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                {getQuickActionLabel()}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Rating - always visible at bottom */}
      <RecommendationRating 
        recommendationId={recommendation.id} 
        compact={true}
        onRate={(id, rating, feedback, reasons) => {
          console.log('Recommendation rating:', { id, rating, feedback, reasons });
        }}
      />
    </div>
  );
};

export const InlineRecommendations = ({ 
  recommendations, 
  campaigns, 
  onAction,
  onCloneCreative 
}: InlineRecommendationsProps) => {
  const navigate = useNavigate();
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const handleOpenFullView = () => {
    // Store recommendations in sessionStorage for the full view page
    sessionStorage.setItem('vibelets_recommendations', JSON.stringify(recommendations));
    sessionStorage.setItem('vibelets_campaigns', JSON.stringify(campaigns));
    window.open('/recommendations', '_blank');
  };

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesPriority = priorityFilter === 'all' || rec.priority === priorityFilter;
    const matchesLevel = levelFilter === 'all' || rec.level === levelFilter;
    return matchesPriority && matchesLevel;
  });

  if (recommendations.length === 0) {
    return (
      <div className="p-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">All optimized!</p>
              <p className="text-xs text-muted-foreground">No recommendations right now</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header with expand button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">AI Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              {filteredRecommendations.length} of {recommendations.length} action{recommendations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenFullView}
          className="h-9 text-sm px-3 text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ExternalLink className="h-4 w-4" />
          Full View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/notifications')}
          className="h-9 text-sm px-3 text-muted-foreground hover:text-foreground gap-1.5"
        >
          <Bell className="h-4 w-4" />
          History
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[110px] h-8 text-xs bg-muted/30 border-border/50">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="high">Urgent</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="suggestion">Tips</SelectItem>
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[110px] h-8 text-xs bg-muted/30 border-border/50">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="campaign">Campaign</SelectItem>
            <SelectItem value="adset">Ad Set</SelectItem>
            <SelectItem value="ad">Ad</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 2x2 Grid of recommendations */}
      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-6 glass-card rounded-xl">
          <p className="text-sm text-muted-foreground">No recommendations match filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredRecommendations.map((rec) => (
            <RecommendationCard 
              key={rec.id} 
              recommendation={rec} 
              onAction={onAction}
              onCloneCreative={onCloneCreative}
            />
          ))}
        </div>
      )}
    </div>
  );
};