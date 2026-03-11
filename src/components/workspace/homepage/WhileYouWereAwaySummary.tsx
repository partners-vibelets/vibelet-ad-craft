import { useState } from 'react';
import { Clock, X, AlertTriangle, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoKPI } from '@/data/homepageDemoData';

interface WhileYouWereAwaySummaryProps {
  lastActive: string | null;
  kpis: DemoKPI[];
  onDismiss: () => void;
  onViewDetails: () => void;
}

interface AlertChip {
  label: string;
  severity: 'critical' | 'warning' | 'info';
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

function buildSummaryBullets(kpis: DemoKPI[]): string[] {
  const bullets: string[] = [];
  const spend = kpis.find(k => k.id === 'spend');
  const roas = kpis.find(k => k.id === 'roas');
  const cpa = kpis.find(k => k.id === 'cpa');
  const ctr = kpis.find(k => k.id === 'ctr');

  if (spend) bullets.push(`Spend ${spend.direction === 'up' ? 'increased' : 'decreased'} ${Math.abs(spend.delta).toFixed(0)}% (${spend.previousValue} → ${spend.value})`);
  if (roas && !roas.good) bullets.push(`ROAS dropped from ${roas.previousValue} to ${roas.value}`);
  if (roas && roas.good) bullets.push(`ROAS improved from ${roas.previousValue} to ${roas.value}`);
  if (cpa && !cpa.good) bullets.push(`CPA rose to ${cpa.value} — was ${cpa.previousValue}`);
  if (ctr && !ctr.good) bullets.push(`CTR declined ${Math.abs(ctr.delta).toFixed(0)}% to ${ctr.value}`);
  if (ctr && ctr.good) bullets.push(`CTR improved ${Math.abs(ctr.delta).toFixed(0)}% to ${ctr.value}`);

  return bullets;
}

function buildAlertChips(kpis: DemoKPI[]): AlertChip[] {
  const chips: AlertChip[] = [];
  kpis.forEach(kpi => {
    if (kpi.id === 'top-ad') return;
    const absDelta = Math.abs(kpi.delta);
    if (absDelta > 40) {
      chips.push({ label: `${kpi.label} ${kpi.direction === 'up' ? 'up' : 'down'} ${absDelta.toFixed(0)}%+`, severity: 'critical' });
    } else if (absDelta > 20 && !kpi.good) {
      chips.push({ label: `${kpi.label} shifted ${absDelta.toFixed(0)}%`, severity: 'warning' });
    }
  });
  return chips;
}

export const WhileYouWereAwaySummary = ({ lastActive, kpis, onDismiss, onViewDetails }: WhileYouWereAwaySummaryProps) => {
  const [dismissed, setDismissed] = useState(false);
  const { text: awayText, hours } = getAwayDuration(lastActive);
  const bullets = buildSummaryBullets(kpis);
  const alertChips = buildAlertChips(kpis);

  if (dismissed || (hours < 1 && lastActive)) return null;

  const negativeCount = kpis.filter(k => k.id !== 'top-ad' && !k.good).length;

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
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Alert chips */}
        {alertChips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {alertChips.map((chip, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium",
                  chip.severity === 'critical'
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                    : "bg-muted/30 border-border/40 text-muted-foreground"
                )}
              >
                {chip.severity === 'critical' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <AlertTriangle className="w-3 h-3" />
                )}
                {chip.label}
              </div>
            ))}
          </div>
        )}

        {/* Bullet summary */}
        <ul className="space-y-1.5 pl-1">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>

        {/* Bottom summary */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-muted-foreground">
            {negativeCount >= 2
              ? "Your AI has identified actions to reduce waste and improve ROAS. Review and approve below."
              : negativeCount === 1
                ? "1 metric shifted — the rest looks stable. Review recommendations below."
                : "Things are looking good overall."
            }
          </p>
          <button
            onClick={onViewDetails}
            className="text-[11px] text-primary hover:underline font-medium shrink-0 ml-3"
          >
            View full breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
