import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  DollarSign,
  Target,
  Activity,
  Clock,
  Shield,
  Sparkles,
  Eye,
  Play,
  BookmarkPlus,
  ChevronRight
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { mockReasons, mockActions, mockWasteItems, mockHealthMetrics, mockLiveAlerts } from './mockData';
import { AlertsSidebar } from './AlertsSidebar';

// Confidence Badge
const ConfidenceBadge = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
    <div className={cn(
      "w-1.5 h-1.5 rounded-full",
      value >= 85 ? "bg-emerald-400" : value >= 70 ? "bg-amber-400" : "bg-red-400"
    )} />
    <span className="text-xs font-medium text-primary">{value}%</span>
  </div>
);

// Risk Badge
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

// Circular Progress Ring
const CircularProgress = ({ value, size = 96, strokeWidth = 4, status }: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  status: 'good' | 'warning' | 'critical';
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  const strokeColor = status === 'good' 
    ? 'stroke-emerald-400' 
    : status === 'warning' 
      ? 'stroke-amber-400' 
      : 'stroke-red-400';
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={cn(strokeColor, "transition-all duration-700 ease-out")}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
        }}
      />
    </svg>
  );
};

// Reason Card Config
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

// Account Health Hero
const AccountHealthHero = () => {
  const overallHealth = 94;
  const healthStatus = overallHealth >= 80 ? 'good' : overallHealth >= 50 ? 'warning' : 'critical';
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="relative w-24 h-24">
            <CircularProgress value={overallHealth} size={96} strokeWidth={4} status={healthStatus} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center transition-all",
                healthStatus === 'good' && "bg-emerald-500/10",
                healthStatus === 'warning' && "bg-amber-500/10",
                healthStatus === 'critical' && "bg-red-500/10"
              )}>
                <Shield className={cn(
                  "w-8 h-8",
                  healthStatus === 'good' && "text-emerald-400",
                  healthStatus === 'warning' && "text-amber-400",
                  healthStatus === 'critical' && "text-red-400"
                )} />
              </div>
            </div>
          </div>
          <div className={cn(
            "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-background",
            healthStatus === 'good' && "bg-emerald-500 text-white",
            healthStatus === 'warning' && "bg-amber-500 text-white",
            healthStatus === 'critical' && "bg-red-500 text-white"
          )}>
            ✓
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold text-foreground">{overallHealth}%</span>
            <span className={cn(
              "text-sm font-medium px-2 py-0.5 rounded-full",
              healthStatus === 'good' && "bg-emerald-500/10 text-emerald-400",
              healthStatus === 'warning' && "bg-amber-500/10 text-amber-400",
              healthStatus === 'critical' && "bg-red-500/10 text-red-400"
            )}>
              {healthStatus === 'good' ? 'Healthy' : healthStatus === 'warning' ? 'Needs Attention' : 'Critical'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Overall Account Health</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {mockHealthMetrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                metric.status === 'good' && "bg-emerald-400",
                metric.status === 'warning' && "bg-amber-400",
                metric.status === 'critical' && "bg-red-400"
              )} />
              <span className="text-lg font-semibold text-foreground">{metric.value}%</span>
            </div>
            <p className="text-xs text-muted-foreground">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Why Section
const WhySection = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        What's Going On
      </h2>
      <div className="grid grid-cols-3 gap-4 items-start">
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
                "rounded-xl border transition-all duration-300 group/reason",
                isOpen 
                  ? cn(config.bgColor, config.borderColor, "shadow-lg", config.glowColor, "scale-[1.02]")
                  : cn("bg-card/50", config.borderColor, "hover:bg-card/80 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg")
              )}>
                <CollapsibleTrigger className="w-full group">
                  <div className="flex flex-col p-5">
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
                    <p className="text-sm font-medium text-foreground text-left leading-relaxed min-h-[48px]">
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
    </section>
  );
};

// Waste Section
const WasteSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const totalWaste = mockWasteItems.reduce((sum, item) => {
    const amount = parseInt(item.amount.replace('₹', '').replace(',', ''));
    return sum + amount;
  }, 0);

  return (
    <section className="mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">
                  ₹{totalWaste.toLocaleString()} may have been wasted last week
                </h3>
                <p className="text-sm text-muted-foreground">
                  {mockWasteItems.length} things to look at
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
    <section className="mb-8">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        What You Can Do
        <span className="text-xs text-muted-foreground font-normal normal-case ml-2">
          Sorted by biggest impact first
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
                          Why We Suggest This
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
                            How We Know
                          </h4>
                          <p className="text-sm text-foreground/80">{action.dataUsed}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            How Predictable
                          </h4>
                          <span className={cn(
                            "text-sm",
                            action.variance === 'Low' && "text-emerald-400",
                            action.variance === 'Medium' && "text-amber-400",
                            action.variance === 'High' && "text-red-400"
                          )}>
                            {action.variance === 'Low' ? 'Very likely' : action.variance === 'Medium' ? 'Likely' : 'Less certain'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <h4 className="text-xs font-semibold text-amber-400 mb-1">What Happens If You Skip This</h4>
                      <p className="text-sm text-foreground/70">{action.consequence}</p>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Play className="w-3 h-3 mr-1.5" />
                        See What Would Happen
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                        <BookmarkPlus className="w-3 h-3 mr-1.5" />
                        Save for Later
                      </Button>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </section>
  );
};

// Money Map Section
const MoneyMap = () => (
  <section className="p-6 rounded-xl bg-muted/20 border border-border/30">
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
      <DollarSign className="w-4 h-4 text-primary" />
      Where Your Money Goes
    </h2>
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 flex items-center gap-4">
        <div className="flex-1 p-4 rounded-lg bg-card/50 border border-border/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">You Spent</p>
          <p className="text-xl font-bold text-foreground">₹12,450</p>
          <p className="text-xs text-amber-400 mt-1">Most went to just 2 campaigns</p>
        </div>
        
        <div className="flex flex-col items-center text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </div>
        
        <div className="flex-1 p-4 rounded-lg bg-card/50 border border-border/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">Sales You Got</p>
          <p className="text-xl font-bold text-foreground">847</p>
          <p className="text-xs text-emerald-400 mt-1">Most from your top 3 ads</p>
        </div>
        
        <div className="flex flex-col items-center text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </div>
        
        <div className="flex-1 p-4 rounded-lg bg-card/50 border border-border/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">You Earned</p>
          <p className="text-xl font-bold text-foreground">₹48,230</p>
          <p className="text-xs text-muted-foreground mt-1">₹3.87 back for every ₹1 spent</p>
        </div>
      </div>
      
      <div className="w-px h-16 bg-border/50" />
      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-center min-w-[140px]">
        <p className="text-xs text-red-400 mb-1 flex items-center justify-center gap-1">
          <TrendingDown className="w-3 h-3" />
          Money Lost
        </p>
        <p className="text-xl font-bold text-red-400">₹2,240</p>
        <p className="text-xs text-muted-foreground mt-1">18% didn't bring results</p>
      </div>
    </div>
  </section>
);

// Verdict Bar
const VerdictBar = () => (
  <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 via-background to-primary/5 border border-primary/20 mb-8">
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-primary/30">
            <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-primary">
            30-Day Audit Summary
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">
          You could be making <span className="text-primary font-extrabold">~18% more</span> by fixing a few things
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50">
            <Eye className="w-3.5 h-3.5 text-primary/70" />
            Based on last 30 days
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50">
            <Shield className="w-3.5 h-3.5 text-emerald-400/70" />
            87% sure about this
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50">
            <Clock className="w-3.5 h-3.5 text-amber-400/70" />
            Checked 14 mins ago
          </span>
        </div>
      </div>
    </div>
  </div>
);

export const AuditView = () => {
  return (
    <div className="animate-fade-in">
      {/* Account Health Hero - Top of page */}
      <div className="p-6 rounded-xl bg-gradient-to-b from-emerald-500/5 to-transparent border border-emerald-500/10 mb-8">
        <AccountHealthHero />
      </div>

      {/* Two Column Layout: Main Content + Alerts Sidebar */}
      <div className="flex gap-6">
        {/* Main Content - Left */}
        <div className="flex-1 min-w-0">
          {/* Verdict Bar */}
          <VerdictBar />

          {/* Why Section */}
          <WhySection />

          {/* Waste Section */}
          <WasteSection />

          {/* Action Stack */}
          <ActionStack />

          {/* Money Map */}
          <MoneyMap />
        </div>
        
        {/* Alerts Sidebar - Right */}
        <AlertsSidebar alerts={mockLiveAlerts} />
      </div>
    </div>
  );
};
