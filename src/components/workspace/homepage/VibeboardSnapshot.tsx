import { BarChart3, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoKPI } from '@/data/homepageDemoData';

interface VibeboardSnapshotProps {
  kpis: DemoKPI[];
  isSample: boolean;
  onViewFull: () => void;
}

export const VibeboardSnapshot = ({ kpis, isSample, onViewFull }: VibeboardSnapshotProps) => {
  const metricKPIs = kpis.filter(k => k.id !== 'top-ad');
  const topAd = kpis.find(k => k.id === 'top-ad');

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Vibeboard</h3>
          {isSample && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">
              Preview (sample data — not live)
            </span>
          )}
        </div>
        <button onClick={onViewFull} className="text-[11px] text-primary hover:underline flex items-center gap-1">
          View full vibeboard <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {metricKPIs.map((kpi, i) => (
          <div
            key={kpi.id}
            className="rounded-xl border border-border/40 bg-card/80 p-3.5 space-y-1.5 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
          >
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className="text-lg font-semibold text-foreground">{kpi.value}</p>
            <div className="flex items-center gap-1.5">
              {kpi.good ? (
                <TrendingUp className="w-3 h-3 text-secondary" />
              ) : (
                <TrendingDown className="w-3 h-3 text-amber-500" />
              )}
              <span className={cn(
                "text-[10px] font-medium",
                kpi.good ? "text-secondary" : "text-amber-500"
              )}>
                {kpi.delta > 0 ? '+' : ''}{kpi.delta.toFixed(1)}%
              </span>
              <span className="text-[10px] text-muted-foreground/60">vs 7d</span>
            </div>
          </div>
        ))}
      </div>

      {topAd && (
        <div className="rounded-xl border border-border/30 bg-muted/20 px-3.5 py-2.5 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">🏆 Top performing:</span>
          <span className="text-xs font-medium text-foreground">{topAd.value}</span>
        </div>
      )}
    </div>
  );
};
