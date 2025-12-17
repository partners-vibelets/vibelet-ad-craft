import { useEffect, useState } from 'react';
import { AIRecommendation, PublishedCampaign, RecommendationLevel } from '@/types/campaign';
import { Sparkles, TrendingUp, Copy, Play, Pause, DollarSign, Check, X, Layers, Target, Image, Megaphone, ArrowLeft, DollarSign as Spent, TrendingUp as Profit, Percent, ShoppingCart, Receipt, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { mockUnifiedMetrics } from '@/data/mockPerformanceData';
import { RecommendationRating } from '@/components/dashboard/performance/RecommendationRating';

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
    creative: { label: 'Creative', icon: Image, className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' }
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
      "glass-card p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:scale-[1.01]",
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
          {showCustomInput ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Custom budget:</span>
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={customInputValue}
                  onChange={(e) => setCustomInputValue(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1"
                  disabled={isApplied}
                />
                <span className="text-sm text-muted-foreground">/day</span>
              </div>
              <Button 
                variant="secondary" 
                onClick={() => handleApply(parseFloat(customInputValue))}
                disabled={isApplied || isProcessing}
              >
                <Check className="h-4 w-4 mr-1" />
                Apply
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  <p className="text-lg font-semibold text-muted-foreground">${recommendation.currentValue}<span className="text-xs">/day</span></p>
                </div>
                <div className="flex items-center text-secondary">
                  <TrendingUp className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">+{Math.round(((recommendation.recommendedValue || 0) - (recommendation.currentValue || 0)) / (recommendation.currentValue || 1) * 100)}%</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Recommended</p>
                  <p className="text-lg font-semibold text-secondary">${recommendation.recommendedValue}<span className="text-xs">/day</span></p>
                </div>
              </div>
            </div>
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
        <>
          <div className="flex items-center justify-center py-3 text-secondary">
            <Check className="h-5 w-5 mr-2" />
            <span className="font-medium">Applied</span>
          </div>
          <RecommendationRating 
            recommendationId={recommendation.id}
            compact={false}
            onRate={(id, rating, feedback) => {
              console.log('Rating:', { id, rating, feedback });
            }}
          />
        </>
      )}
    </div>
  );
};

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [campaigns, setCampaigns] = useState<PublishedCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

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

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCampaign = selectedCampaign === 'all' || rec.campaignName === selectedCampaign;
    const matchesPriority = priorityFilter === 'all' || rec.priority === priorityFilter;
    const matchesLevel = levelFilter === 'all' || rec.level === levelFilter;
    return matchesCampaign && matchesPriority && matchesLevel;
  });

  // Get unique campaign names for filter
  const uniqueCampaigns = [...new Set(recommendations.map(r => r.campaignName))];

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

      {/* Campaign Filter Bar */}
      <div className="border-b border-border/50 bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="w-[320px] h-12 bg-muted/30 border-border/50">
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {uniqueCampaigns.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCampaign !== 'all' && (
              <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                active
              </Badge>
            )}
            <div className="ml-auto text-sm text-muted-foreground">
              Status: <Badge className="bg-secondary/20 text-secondary border-secondary/30 ml-1">active</Badge>
            </div>
          </div>
        </div>
      </div>

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
          <div className="flex gap-6 max-w-7xl mx-auto">
            {/* Left side - Campaign Performance Widget */}
            <div className="w-80 flex-shrink-0">
              <div className="glass-card rounded-xl p-5 sticky top-24">
                <h3 className="text-sm font-semibold text-foreground mb-4">Campaign Performance</h3>
                
                {/* Metrics Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Spent className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">Total Spent</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">${mockUnifiedMetrics.totalSpent.value.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Profit className="h-4 w-4 text-secondary" />
                      </div>
                      <span className="text-xs text-muted-foreground">Profit</span>
                    </div>
                    <span className="text-lg font-semibold text-secondary">${mockUnifiedMetrics.profit.value.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Percent className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="text-xs text-muted-foreground">ROI</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{mockUnifiedMetrics.roi.value}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-xs text-muted-foreground">Conversions</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{mockUnifiedMetrics.conversions.value.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Receipt className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="text-xs text-muted-foreground">Avg Order</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">${mockUnifiedMetrics.aov.value.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Campaigns summary */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Active Campaigns</p>
                  <div className="space-y-2">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between text-xs">
                        <span className="text-foreground truncate max-w-[140px]">{campaign.name}</span>
                        <Badge variant="outline" className="text-[10px] h-5 bg-secondary/10 text-secondary border-secondary/20">
                          {campaign.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Recommendations */}
            <div className="flex-1">
              {/* Recommendation Filters */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filter:</span>
                </div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-border/50">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">Urgent</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="suggestion">Tips</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-border/50">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="adset">Ad Set</SelectItem>
                    <SelectItem value="ad">Ad</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground ml-auto">
                  {filteredRecommendations.length} of {recommendations.length} shown
                </span>
              </div>

              {/* Recommendation Cards */}
              <div className="space-y-4">
                {filteredRecommendations.length === 0 ? (
                  <div className="text-center py-8 glass-card rounded-xl">
                    <p className="text-muted-foreground">No recommendations match your filters</p>
                  </div>
                ) : (
                  filteredRecommendations.map((rec) => (
                    <FullRecommendationCard key={rec.id} recommendation={rec} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}