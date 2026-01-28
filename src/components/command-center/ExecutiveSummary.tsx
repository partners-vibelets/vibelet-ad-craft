import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  ShoppingCart,
  Zap
} from 'lucide-react';

interface SummaryMetric {
  label: string;
  value: string;
  change: string;
  direction: 'up' | 'down' | 'neutral';
  isGood: boolean;
}

const summaryMetrics: SummaryMetric[] = [
  {
    label: 'Total Spend',
    value: '₹12,450',
    change: '+8%',
    direction: 'up',
    isGood: false
  },
  {
    label: 'Revenue',
    value: '₹48,230',
    change: '+23%',
    direction: 'up',
    isGood: true
  },
  {
    label: 'ROAS',
    value: '3.87x',
    change: '+12%',
    direction: 'up',
    isGood: true
  },
  {
    label: 'Conversions',
    value: '847',
    change: '+15%',
    direction: 'up',
    isGood: true
  },
  {
    label: 'Cost/Conversion',
    value: '₹14.70',
    change: '-8%',
    direction: 'down',
    isGood: true
  }
];

const keyFindings = [
  {
    type: 'positive' as const,
    text: 'Your best campaign drives 67% of all conversions',
    icon: Target
  },
  {
    type: 'warning' as const,
    text: '₹2,240 spent on ads with no conversions',
    icon: DollarSign
  },
  {
    type: 'positive' as const,
    text: 'Weekend performance is 34% higher than weekdays',
    icon: TrendingUp
  }
];

export const ExecutiveSummary = () => {
  return (
    <div className="mb-8">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {summaryMetrics.map((metric) => (
          <div 
            key={metric.label}
            className="p-4 rounded-xl bg-card/50 border border-border/50 hover:bg-card/80 transition-colors"
          >
            <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">{metric.value}</span>
              <span className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                metric.isGood ? "text-emerald-400" : "text-amber-400"
              )}>
                {metric.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : metric.direction === 'down' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : null}
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Key Findings */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary" />
          Key Findings
        </span>
        {keyFindings.map((finding, index) => {
          const IconComponent = finding.icon;
          return (
            <div 
              key={index}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
                finding.type === 'positive' 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                  : "bg-amber-500/5 border-amber-500/20 text-foreground"
              )}
            >
              <IconComponent className={cn(
                "w-4 h-4",
                finding.type === 'positive' ? "text-emerald-400" : "text-amber-400"
              )} />
              <span>{finding.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
