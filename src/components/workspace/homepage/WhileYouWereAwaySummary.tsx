import { useState } from 'react';
import { Clock, TrendingUp, TrendingDown, X, Zap, DollarSign, Target, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoKPI } from '@/data/homepageDemoData';

interface WhileYouWereAwaySummaryProps {
  lastActive: string | null;
  kpis: DemoKPI[];
  onDismiss: () => void;
  onViewDetails: () => void;
}

interface AwaySummaryMetric {
  label: string;
  before: string;
  after: string;
  delta: string;
  isGood: boolean;
}

function getAwayDuration(lastActive: string | null): { text: string; hours: number } {
  if (!lastActive) return { text: '7 days', hours: 168 };
  const ms = Date.now() - new Date(lastActive).getTime();
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return { text: 'less than an hour', hours: 0 };
  if (hours < 24) return { text: `${hours} hour${hours > 1 ? 's' : ''}`, hours };
  const days = Math.floor(hours / 24);
  return { text: `${days} day${days > 1 ? 's' : ''}`, hours };
}

function buildSummaryMetrics(kpis: DemoKPI[]): AwaySummaryMetric[] {
  return kpis
    .filter(k => k.id !== 'top-ad')
    .map(kpi => ({
      label: kpi.label,
      before: kpi.previousValue,
      after: kpi.value,
      delta: `${kpi.delta > 0 ? '+' : ''}${kpi.delta.toFixed(1)}%`,
      isGood: kpi.good,
    }));
}

export const WhileYouWereAwaySummary = ({ lastActive, kpis, onDismiss, onViewDetails }: WhileYouWereAwaySummaryProps) => {
  const [dismissed, setDismissed] = useState(false);
  const { text: awayText, hours } = getAwayDuration(lastActive);
  const metrics = buildSummaryMetrics(kpis);

  // Don't show for very short absences (< 1 hour) unless demo
  if (dismissed || (hours < 1 && lastActive)) return null;

  const negativeCount = metrics.filter(m => !m.isGood).length;
  const totalSpendDelta = kpis.find(k => k.id === 'spend')?.delta || 0;
  const roasDelta = kpis.find(k => k.id === 'roas')?.delta || 0;

  const headline = negativeCount >= 2
    ? `${negativeCount} metrics need attention`
    : negativeCount === 1
      ? '1 metric shifted — rest looks stable'
      : 'Things are looking good';

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">While you were away</h3>
            <p className="text-[11px] text-muted-foreground">Gone for {awayText}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium",
            negativeCount >= 2
              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
          )}>
            {headline}
          </span>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric comparison grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map(metric => (
            <div key={metric.label} className="rounded-xl border border-border/40 bg-card/60 p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground font-medium">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">{metric.after}</span>
                <span className={cn(
                  "flex items-center gap-0.5 text-[11px] font-medium",
                  metric.isGood ? "text-emerald-500" : "text-amber-500"
                )}>
                  {metric.isGood
                    ? <TrendingUp className="w-3 h-3" />
                    : <TrendingDown className="w-3 h-3" />
                  }
                  {metric.delta}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">was {metric.before}</p>
            </div>
          ))}
        </div>

        {/* Quick summary line */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Spend {totalSpendDelta > 0 ? 'increased' : 'decreased'} {Math.abs(totalSpendDelta).toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              ROAS {roasDelta > 0 ? 'improved' : 'dropped'} {Math.abs(roasDelta).toFixed(0)}%
            </span>
          </div>
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
          >
            <Eye className="w-3 h-3" />
            View full breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
