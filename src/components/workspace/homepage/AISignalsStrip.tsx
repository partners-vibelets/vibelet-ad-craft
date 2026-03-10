import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoAlert } from '@/data/homepageDemoData';

interface AISignalsStripProps {
  alerts: DemoAlert[];
  isSample: boolean;
  pausedAlerts: string[];
  onMicroAction: (alertId: string, action: string, campaignName: string) => void;
}

export const AISignalsStrip = ({ alerts, isSample, pausedAlerts, onMicroAction }: AISignalsStripProps) => {
  const visibleAlerts = alerts.slice(0, 4);

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-medium text-foreground">AI Signals</h3>
          {isSample && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">
              sample
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {visibleAlerts.map((alert, i) => {
          const isPaused = pausedAlerts.includes(alert.id);
          return (
            <div
              key={alert.id}
              className={cn(
                "rounded-xl border p-3.5 space-y-2.5 transition-all animate-fade-in",
                isPaused
                  ? "border-border/30 bg-muted/20 opacity-60"
                  : alert.severity === 'high'
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-border/40 bg-card/80"
              )}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {alert.delta > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span className={cn("text-xs font-medium truncate", isPaused ? "line-through text-muted-foreground" : "text-foreground")}>
                    {alert.title}
                  </span>
                </div>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium",
                  isPaused ? "bg-muted text-muted-foreground" :
                  alert.severity === 'high' ? "bg-amber-500/15 text-amber-600" :
                  alert.severity === 'medium' ? "bg-amber-400/10 text-amber-500" :
                  "bg-muted text-muted-foreground"
                )}>
                  {isPaused ? 'paused' : alert.severity}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.rationale}</p>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  est. impact: <span className="font-medium text-foreground">{alert.estimatedImpact}%</span>
                </span>
                <div className="flex gap-1.5">
                  {!isPaused && alert.microActions.map(ma => (
                    <button
                      key={ma.action}
                      onClick={() => onMicroAction(alert.id, ma.action, alert.campaignName)}
                      className="text-[10px] font-medium px-2 py-1 rounded-lg bg-muted/50 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border transition-all active:scale-95"
                    >
                      {ma.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
