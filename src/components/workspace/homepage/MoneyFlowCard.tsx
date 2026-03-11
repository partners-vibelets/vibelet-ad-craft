import { DollarSign, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MoneyFlowData {
  period: string;
  spent: string;
  spentContext: string;
  sales: string;
  salesContext: string;
  earned: string;
  earnedContext: string;
  profit: string;
  profitContext: string;
  profitPositive: boolean;
}

interface MoneyFlowCardProps {
  data: MoneyFlowData;
  onViewFull: () => void;
}

export const MoneyFlowCard = ({ data, onViewFull }: MoneyFlowCardProps) => {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 overflow-hidden animate-fade-in">
      {/* Header row */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Money Flow</h3>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{data.period}</p>
          </div>
        </div>
        <button onClick={onViewFull} className="text-[11px] text-primary hover:underline flex items-center gap-1">
          View details <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 divide-x divide-border/30">
        <MetricCell
          label="YOU SPENT"
          value={data.spent}
          context={data.spentContext}
          contextColor="text-primary"
        />
        <MetricCell
          label="SALES YOU GOT"
          value={data.sales}
          context={data.salesContext}
          contextColor="text-primary"
        />
        <MetricCell
          label="YOU EARNED"
          value={data.earned}
          context={data.earnedContext}
          contextColor="text-muted-foreground"
        />
        <MetricCell
          label="PROFIT EARNED"
          value={data.profit}
          context={data.profitContext}
          contextColor={data.profitPositive ? "text-emerald-500" : "text-amber-500"}
        />
      </div>
    </div>
  );
};

const MetricCell = ({ label, value, context, contextColor }: {
  label: string;
  value: string;
  context: string;
  contextColor: string;
}) => (
  <div className="px-4 py-4 text-center space-y-1.5">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
    <p className="text-xl font-bold text-foreground">{value}</p>
    <p className={cn("text-[10px] leading-tight", contextColor)}>{context}</p>
  </div>
);
