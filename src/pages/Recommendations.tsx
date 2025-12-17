import { useEffect, useState } from 'react';
import { AIRecommendation, PublishedCampaign, RecommendationLevel } from '@/types/campaign';
import { Sparkles, TrendingUp, Copy, Play, Pause, DollarSign, Check, X, Layers, Target, Image, Megaphone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Priority badge component
const PriorityBadge = ({ priority }: { priority: AIRecommendation['priority'] }) => {
  const config = {
    high: { label: 'Urgent', className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
    medium: { label: 'Medium', className: 'bg-muted text-muted-foreground border-border' },
    suggestion: { label: 'Tip', className: 'bg-muted text-muted-foreground border-border' }
  };

  const { label, className } = config[priority];

  return (
    <Badge variant="outline" className={cn("text-xs px-2 py-0.5", className)}>
      {label}
    </Badge>
  );
};

// Level badge component
const LevelBadge = ({ level }: { level: RecommendationLevel }) => {
  const config = {
    campaign: { label: 'Campaign', icon: Megaphone, className: 'bg-primary/10 text-primary border-primary/20' },
    adset: { label: 'Ad Set', icon: Target, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    ad: { label: 'Ad', icon: Layers, className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    creative: { label: 'Creative', icon: Image, className: 'bg-pink-500/10 text-pink-600 border-pink-500/20' }
  };

  const { label, icon: Icon, className } = config[level];

  return (
    <Badge variant="outline" className={cn("text-xs px-2 py-0.5 gap-1", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

// Type icon component
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
      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
      isUrgent ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground"
    )}>
      <Icon className="h-5 w-5" />
    </div>
  );
};

// Confidence score with more detail
const ConfidenceDisplay = ({ score }: { score: number }) => {
  const getColor = () => {
    if (score >= 85) return 'text-secondary';
    if (score >= 70) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  const getLabel = () => {
    if (score >= 85) return 'High Confidence';
    if (score >= 70) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="flex items-center gap-2">
      <Progress value={score} className="h-2 w-20" />
      <span className={cn("text-xs font-medium", getColor())}>{score}% - {getLabel()}</span>
    </div>
  );
};

// Full recommendation card for the page
const FullRecommendationCard = ({ 
  recommendation 
}: { 
  recommendation: AIRecommendation; 
}) => {
  const [customBudget, setCustomBudget] = useState(recommendation.recommendedValue || 0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const isBudgetRecommendation = recommendation.type === 'budget-increase' || recommendation.type === 'budget-decrease';

  const handleApply = async (value?: number) => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsApplied(true);
    setIsProcessing(false);
    toast.success('Recommendation applied successfully');
  };

  const getActionLabel = () => {
    switch (recommendation.type) {
      case 'budget-increase':
      case 'budget-decrease':
        return `Apply $${recommendation.recommendedValue}/day`;
      case 'pause-creative':
        return 'Pause Creative';
      case 'resume-campaign':
        return 'Resume Campaign';
      case 'clone-creative':
        return 'Clone Creative';
    }
  };

  return (
    <div className={cn(
      "glass-card p-6 rounded-xl transition-all",
      recommendation.priority === 'high' && "border-amber-500/30 bg-amber-500/5",
      isApplied && "opacity-60"
    )}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <TypeIcon type={recommendation.type} priority={recommendation.priority} />
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <PriorityBadge priority={recommendation.priority} />
              <LevelBadge level={recommendation.level} />
            </div>
            <p className="text-sm text-primary font-medium">{recommendation.campaignName}</p>
            <h3 className="text-lg font-semibold text-foreground mt-1">{recommendation.title}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Confidence</p>
          <ConfidenceDisplay score={recommendation.confidenceScore} />
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-1">Why we recommend this</h4>
        <p className="text-sm text-foreground">{recommendation.reasoning}</p>
      </div>

      {/* Performance KPIs for creative recommendations */}
      {recommendation.creative && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={recommendation.creative.thumbnail} 
              alt={recommendation.creative.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{recommendation.creative.name}</p>
              <div className="flex gap-4 mt-1">
                {recommendation.creative.metrics.map((metric, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-muted-foreground">{metric.label}: </span>
                    <span className="font-medium text-foreground">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget controls */}
      {isBudgetRecommendation && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Current: ${recommendation.currentValue}/day</span>
            <span className="text-sm font-medium text-foreground">Recommended: ${recommendation.recommendedValue}/day</span>
          </div>
          {showCustomInput ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder="Enter custom amount"
                className="flex-1"
                disabled={isApplied}
              />
              <Button 
                variant="secondary" 
                onClick={() => handleApply(parseFloat(customInputValue))}
                disabled={isApplied || isProcessing}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowCustomInput(false)}
                disabled={isApplied}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Slider
              value={[customBudget]}
              onValueChange={(v) => setCustomBudget(v[0])}
              min={10}
              max={Math.max((recommendation.recommendedValue || 50) * 2, 200)}
              step={5}
              className="w-full"
              disabled={isApplied}
            />
          )}
        </div>
      )}

      {/* Projected Impact */}
      {recommendation.projectedImpact && recommendation.projectedImpact.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Projected Impact</h4>
          <div className="grid grid-cols-3 gap-3">
            {recommendation.projectedImpact.map((impact, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">{impact.label}</p>
                <p className="text-sm font-semibold text-foreground">{impact.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isApplied && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/50">
          {isBudgetRecommendation && (
            <Button 
              variant="ghost" 
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-muted-foreground"
            >
              {showCustomInput ? 'Use Recommended' : 'Custom Amount'}
            </Button>
          )}
          <Button 
            onClick={() => handleApply()}
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            {isProcessing ? 'Applying...' : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {getActionLabel()}
              </>
            )}
          </Button>
        </div>
      )}

      {isApplied && (
        <div className="flex items-center justify-center py-3 text-secondary">
          <Check className="h-5 w-5 mr-2" />
          <span className="font-medium">Applied</span>
        </div>
      )}
    </div>
  );
};

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [campaigns, setCampaigns] = useState<PublishedCampaign[]>([]);

  useEffect(() => {
    // Load data from sessionStorage
    const storedRecommendations = sessionStorage.getItem('vibelets_recommendations');
    const storedCampaigns = sessionStorage.getItem('vibelets_campaigns');
    
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations));
    }
    if (storedCampaigns) {
      setCampaigns(JSON.parse(storedCampaigns));
    }
  }, []);

  const handleGoBack = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleGoBack} className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Vibelets Optimization Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} to improve your campaigns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {recommendations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">All optimized!</h2>
            <p className="text-muted-foreground">No recommendations available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {recommendations.map((rec) => (
              <FullRecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}