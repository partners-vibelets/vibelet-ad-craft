import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  DollarSign,
  Target,
  Activity,
  Clock,
  Shield,
  ArrowDownRight,
  Sparkles,
  Eye,
  Play,
  BookmarkPlus,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Types
interface Reason {
  id: string;
  title: string;
  explanation: string[];
  dataWindow: string;
  confidence: number;
}

interface ActionItem {
  id: string;
  title: string;
  impact: string;
  confidence: number;
  risk: 'Low' | 'Medium' | 'High';
  whyWorks: string[];
  dataUsed: string;
  variance: 'Low' | 'Medium' | 'High';
  consequence: string;
}

interface WasteItem {
  id: string;
  name: string;
  type: 'campaign' | 'adset';
  amount: string;
  reason: string;
  confidence: number;
}

interface LiveAlert {
  id: string;
  message: string;
  time: string;
  type: 'positive' | 'negative';
}

interface HealthMetric {
  label: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
}

// Mock Data
const mockReasons: (Reason & { icon: 'budget' | 'fatigue' | 'waste' })[] = [
  {
    id: '1',
    title: 'Budget skew in Evergreen Content campaign',
    explanation: [
      '73% of daily budget consumed by 2 underperforming ad sets',
      'Top-performing creatives receiving only 12% of total spend'
    ],
    dataWindow: 'Last 30 days',
    confidence: 91,
    icon: 'budget'
  },
  {
    id: '2',
    title: 'Ad fatigue detected in 2 ad sets',
    explanation: [
      'CTR declined 34% over past 14 days despite stable impressions',
      'Frequency now at 4.2x (threshold: 3.0x)'
    ],
    dataWindow: 'Last 14 days',
    confidence: 88,
    icon: 'fatigue'
  },
  {
    id: '3',
    title: '₹900 spent with weak conversion intent (last 7 days)',
    explanation: [
      'Clicks from low-intent audiences with <0.5% conversion rate',
      'Geographic targeting includes low-performing regions'
    ],
    dataWindow: 'Last 7 days',
    confidence: 79,
    icon: 'waste'
  }
];

const mockActions: ActionItem[] = [
  {
    id: '1',
    title: 'Reallocate ₹450 to Search Expansion',
    impact: '+12% projected ROAS',
    confidence: 88,
    risk: 'Low',
    whyWorks: [
      'Search campaigns show 2.3x higher conversion rate',
      'Similar accounts saw 14-18% ROAS lift with this change'
    ],
    dataUsed: '34 days of stable CPA data',
    variance: 'Low',
    consequence: 'Continued budget drain on underperforming segments, estimated ₹1,200 waste over next 7 days'
  },
  {
    id: '2',
    title: 'Pause fatigued creatives in "Summer Sale" ad set',
    impact: '+8% expected CTR recovery',
    confidence: 84,
    risk: 'Low',
    whyWorks: [
      'Fresh creatives in similar contexts recovered CTR within 48-72 hours',
      'Audience overlap suggests immediate response to new visuals'
    ],
    dataUsed: '21 days of creative performance data',
    variance: 'Medium',
    consequence: 'Continued frequency escalation will increase CPM by estimated 15% within 5 days'
  },
  {
    id: '3',
    title: 'Exclude low-intent geographic segments',
    impact: '+₹180 daily savings',
    confidence: 76,
    risk: 'Medium',
    whyWorks: [
      'Bottom 3 regions contribute 22% spend but only 4% conversions',
      'Exclusion won\'t impact reach to high-value audiences'
    ],
    dataUsed: '28 days of regional performance',
    variance: 'Medium',
    consequence: 'Low-ROI spend continues, diluting overall account efficiency metrics'
  }
];

const mockWasteItems: WasteItem[] = [
  {
    id: '1',
    name: 'Evergreen Content - Broad Interests',
    type: 'adset',
    amount: '₹420',
    reason: 'High spend, zero conversions in last 7 days',
    confidence: 92
  },
  {
    id: '2',
    name: 'Summer Sale - Retargeting Lookalike',
    type: 'adset',
    amount: '₹310',
    reason: 'CPA 4x above account average',
    confidence: 85
  },
  {
    id: '3',
    name: 'Brand Awareness - Video Views',
    type: 'campaign',
    amount: '₹170',
    reason: 'No downstream conversions attributed',
    confidence: 71
  }
];

const mockLiveAlerts: LiveAlert[] = [
  { id: '1', message: 'Conversion rate spiked 23% in Search campaign', time: '1h ago', type: 'positive' },
  { id: '2', message: 'CTR drop detected in Summer Sale ad set', time: '2h ago', type: 'negative' }
];

const mockHealthMetrics: HealthMetric[] = [
  { label: 'Performance Consistency', value: 87, status: 'good' },
  { label: 'Ad Fatigue Index', value: 34, status: 'warning' },
  { label: 'Learning Stability', value: 92, status: 'good' }
];

// Components
const ConfidenceBadge = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
    <div className={cn(
      "w-1.5 h-1.5 rounded-full",
      value >= 85 ? "bg-emerald-400" : value >= 70 ? "bg-amber-400" : "bg-red-400"
    )} />
    <span className="text-xs font-medium text-primary">{value}%</span>
  </div>
);

const RiskBadge = ({ risk }: { risk: 'Low' | 'Medium' | 'High' }) => (
  <span className={cn(
    "px-2 py-0.5 rounded text-xs font-medium",
    risk === 'Low' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    risk === 'Medium' && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    risk === 'High' && "bg-red-500/10 text-red-400 border border-red-500/20"
  )}>
    {risk} Risk
  </span>
);

const DataMeta = ({ dataWindow, updated }: { dataWindow: string; updated?: string }) => (
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    <span className="flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {dataWindow}
    </span>
    {updated && (
      <span className="flex items-center gap-1">
        <Activity className="w-3 h-3" />
        Updated {updated}
      </span>
    )}
  </div>
);

// Sticky Verdict Bar
const VerdictBar = () => (
  <div className="sticky top-0 z-50 bg-gradient-to-r from-primary/5 via-background to-primary/5 border-b border-primary/20 backdrop-blur-xl shadow-lg shadow-primary/5 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary)/0.08)_50%,transparent_100%)] animate-shimmer" />
    <div className="max-w-5xl mx-auto px-6 py-6 relative">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 shadow-lg shadow-primary/20">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-primary">
              Action Required
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">
            You're missing <span className="text-primary font-extrabold">~18% ROAS</span> due to fixable budget and fatigue issues
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50">
              <Eye className="w-3.5 h-3.5 text-primary/70" />
              Data: Last 30 days
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50">
              <Shield className="w-3.5 h-3.5 text-emerald-400/70" />
              Confidence: 87%
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50">
              <Clock className="w-3.5 h-3.5 text-amber-400/70" />
              Updated: 14 mins ago
            </span>
          </div>
        </div>
        <a 
          href="#actions" 
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-all px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/40 whitespace-nowrap group"
        >
          See what to fix
          <ArrowDownRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
        </a>
      </div>
    </div>
  </div>
);

// Reason Card Icon & Color Config
const reasonConfig = {
  budget: {
    icon: DollarSign,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    glowColor: 'shadow-blue-500/10'
  },
  fatigue: {
    icon: Activity,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-amber-500/10'
  },
  waste: {
    icon: TrendingDown,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-400',
    glowColor: 'shadow-red-500/10'
  }
};

// Why This Is Happening Section
const WhySection = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <section className="border-b border-border/30">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Why This Is Happening
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {mockReasons.map((reason) => {
            const config = reasonConfig[reason.icon];
            const IconComponent = config.icon;
            const isOpen = openItems.includes(reason.id);
            
            return (
              <Collapsible 
                key={reason.id} 
                open={isOpen}
                onOpenChange={() => toggleItem(reason.id)}
              >
                <div className={cn(
                  "rounded-xl border transition-all duration-300 h-full",
                  config.borderColor,
                  isOpen 
                    ? `${config.bgColor} shadow-lg ${config.glowColor}` 
                    : "bg-card/50 hover:bg-card/80"
                )}>
                  <CollapsibleTrigger className="w-full h-full group">
                    <div className="flex flex-col p-5 h-full min-h-[160px]">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                          config.bgColor,
                          `border ${config.borderColor}`
                        )}>
                          <IconComponent className={cn("w-6 h-6", config.iconColor)} />
                        </div>
                        <ConfidenceBadge value={reason.confidence} />
                      </div>
                      <p className="text-sm font-medium text-foreground text-left flex-1 leading-relaxed">
                        {reason.title}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                        <span className="text-xs text-muted-foreground">{reason.dataWindow}</span>
                        <ChevronDown className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform duration-200",
                          isOpen ? "rotate-180" : "rotate-0"
                        )} />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-5 pb-5">
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                        <ul className="space-y-2">
                          {reason.explanation.map((exp, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className={config.iconColor}>•</span>
                              {exp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Action Stack Section
const ActionStack = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <section id="actions" className="border-b border-border/30">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Recommended Actions
          <span className="text-xs text-muted-foreground font-normal normal-case ml-2">
            Sorted by monetary impact
          </span>
        </h2>
        <div className="space-y-4">
          {mockActions.map((action, index) => (
            <Collapsible 
              key={action.id} 
              open={openItems.includes(action.id)}
              onOpenChange={() => toggleItem(action.id)}
            >
              <div className={cn(
                "rounded-xl border transition-all duration-300 group/card relative",
                openItems.includes(action.id) 
                  ? "bg-card border-primary/30 shadow-lg shadow-primary/10 scale-[1.01]" 
                  : "bg-card/50 border-border/50 hover:border-primary/20 hover:bg-card/80 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 hover:scale-[1.005]",
                index === 0 && "border-primary/40 shadow-[0_0_20px_-5px] shadow-primary/30"
              )}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300",
                        index === 0 
                          ? "bg-primary/20 text-primary group-hover/card:bg-primary/30 group-hover/card:shadow-sm group-hover/card:shadow-primary/20" 
                          : "bg-muted text-muted-foreground group-hover/card:bg-muted/80"
                      )}>
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-semibold text-foreground mb-1">{action.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-emerald-400 flex items-center gap-1 transition-all duration-300 group-hover/card:text-emerald-300">
                            <TrendingUp className="w-3.5 h-3.5 transition-transform duration-300 group-hover/card:scale-110" />
                            {action.impact}
                          </span>
                          <RiskBadge risk={action.risk} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ConfidenceBadge value={action.confidence} />
                      <ChevronDown className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform duration-200",
                        openItems.includes(action.id) ? "rotate-0" : "-rotate-90"
                      )} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 pb-5 pt-0">
                    <div className="border-t border-border/50 pt-4 ml-14">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Why This Works
                          </h4>
                          <ul className="space-y-1.5">
                            {action.whyWorks.map((reason, idx) => (
                              <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                                <Zap className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Data Used
                            </h4>
                            <p className="text-sm text-foreground/80">{action.dataUsed}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Variance
                            </h4>
                            <span className={cn(
                              "text-sm",
                              action.variance === 'Low' && "text-emerald-400",
                              action.variance === 'Medium' && "text-amber-400",
                              action.variance === 'High' && "text-red-400"
                            )}>
                              {action.variance}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <h4 className="text-xs font-semibold text-amber-400 mb-1">If You Don't Act</h4>
                        <p className="text-sm text-foreground/70">{action.consequence}</p>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Play className="w-3 h-3 mr-1.5" />
                          Simulate Impact
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                          <BookmarkPlus className="w-3 h-3 mr-1.5" />
                          Apply Later
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
};

// Money Map Section
const MoneyMap = () => (
  <section className="border-b border-border/30 bg-muted/20">
    <div className="max-w-5xl mx-auto px-6 py-6">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-primary" />
        Money Flow
      </h2>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          {/* Spend */}
          <div className="flex-1 p-4 rounded-lg bg-card/50 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Spend</p>
            <p className="text-xl font-bold text-foreground">₹12,450</p>
            <p className="text-xs text-amber-400 mt-1">68% concentrated in 2 campaigns</p>
          </div>
          
          <div className="flex flex-col items-center text-muted-foreground">
            <ChevronRight className="w-5 h-5" />
          </div>
          
          {/* Conversions */}
          <div className="flex-1 p-4 rounded-lg bg-card/50 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Conversions</p>
            <p className="text-xl font-bold text-foreground">847</p>
            <p className="text-xs text-emerald-400 mt-1">82% from top 3 ad sets</p>
          </div>
          
          <div className="flex flex-col items-center text-muted-foreground">
            <ChevronRight className="w-5 h-5" />
          </div>
          
          {/* Revenue */}
          <div className="flex-1 p-4 rounded-lg bg-card/50 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Revenue</p>
            <p className="text-xl font-bold text-foreground">₹48,230</p>
            <p className="text-xs text-muted-foreground mt-1">ROAS: 3.87x</p>
          </div>
        </div>
        
        {/* Leakage Indicator */}
        <div className="w-px h-16 bg-border/50" />
        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-center min-w-[140px]">
          <p className="text-xs text-red-400 mb-1 flex items-center justify-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Leakage
          </p>
          <p className="text-xl font-bold text-red-400">₹2,240</p>
          <p className="text-xs text-muted-foreground mt-1">18% of total spend</p>
        </div>
      </div>
    </div>
  </section>
);

// Waste & Risk Summary
const WasteSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const totalWaste = mockWasteItems.reduce((sum, item) => {
    const amount = parseInt(item.amount.replace('₹', '').replace(',', ''));
    return sum + amount;
  }, 0);

  return (
    <section className="border-b border-border/30">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-semibold text-foreground">
                    ₹{totalWaste.toLocaleString()} potentially wasted in last 7 days
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {mockWasteItems.length} items flagged for review
                  </p>
                </div>
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 text-muted-foreground transition-transform duration-200",
                isOpen ? "rotate-0" : "-rotate-90"
              )} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 space-y-2">
              {mockWasteItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {item.type === 'campaign' ? 'C' : 'AS'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-red-400">{item.amount}</span>
                    <ConfidenceBadge value={item.confidence} />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};

// Live Intelligence Strip
const LiveIntelligence = () => (
  <div className="fixed bottom-6 right-6 z-40 max-w-sm">
    <div className="space-y-2">
      {mockLiveAlerts.map((alert) => (
        <div 
          key={alert.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-lg",
            alert.type === 'positive' 
              ? "bg-emerald-500/10 border-emerald-500/20" 
              : "bg-amber-500/10 border-amber-500/20"
          )}
        >
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            alert.type === 'positive' ? "bg-emerald-400" : "bg-amber-400"
          )} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{alert.message}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</span>
        </div>
      ))}
    </div>
  </div>
);

// Account Health Section
const AccountHealth = () => {
  const [isOpen, setIsOpen] = useState(false);
  const overallHealth = 94;

  return (
    <section className="pb-24">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50 hover:bg-card/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-semibold text-foreground">
                    Account Health: {overallHealth}%
                  </h3>
                  <p className="text-sm text-emerald-400">Stable</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <Progress value={overallHealth} className="h-2" />
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-200",
                  isOpen ? "rotate-0" : "-rotate-90"
                )} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {mockHealthMetrics.map((metric) => (
                <div 
                  key={metric.label}
                  className="p-4 rounded-lg bg-card/50 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      metric.status === 'good' && "bg-emerald-400",
                      metric.status === 'warning' && "bg-amber-400",
                      metric.status === 'critical' && "bg-red-400"
                    )} />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-foreground">{metric.value}%</span>
                  </div>
                  <Progress 
                    value={metric.value} 
                    className={cn(
                      "h-1 mt-2",
                      metric.status === 'warning' && "[&>div]:bg-amber-400"
                    )} 
                  />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};

// Main Component
const CommandCenter = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Back Navigation */}
      <div className="max-w-5xl mx-auto px-6 py-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Sticky Verdict Bar */}
      <VerdictBar />

      <main>
        <WhySection />
        <ActionStack />
        <WasteSection />
        <AccountHealth />
        <MoneyMap />
      </main>

      {/* Live Intelligence Strip */}
      <LiveIntelligence />
    </div>
  );
};

export default CommandCenter;
