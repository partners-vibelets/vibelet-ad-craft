import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Play, TrendingUp, TrendingDown, Pause, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KeyMoment {
  id: string;
  campaignName: string;
  description: string;
  metric: string;
  metricValue: string;
  riskLevel: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  actionType: 'play' | 'increase' | 'decrease' | 'pause';
  actionLabel: string;
  category: 'working' | 'not_working';
  strategyLogic?: string;
  empiricalData?: string;
}

interface KeyMomentsPanelProps {
  moments: KeyMoment[];
  potentialSavings: string;
  onAction: (momentId: string, actionType: string, campaignName: string) => void;
  onViewAll?: () => void;
  maxPerColumn?: number;
}

export const KeyMomentsPanel = ({ moments, potentialSavings, onAction, onViewAll, maxPerColumn = 3 }: KeyMomentsPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());

  const working = moments.filter(m => m.category === 'working');
  const notWorking = moments.filter(m => m.category === 'not_working');
  const hasMore = working.length > maxPerColumn || notWorking.length > maxPerColumn;

  const handleAction = (moment: KeyMoment) => {
    setActionedIds(prev => new Set(prev).add(moment.id));
    onAction(moment.id, moment.actionType, moment.campaignName);
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Key Moments</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-muted-foreground">POTENTIAL SAVINGS</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs">
              {potentialSavings}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-side columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/30">
        {/* What's Working */}
        <div className="p-4">
          <ColumnHeader label="WHAT'S WORKING" dotColor="bg-emerald-500" count={working.length} />
          <div className="mt-2.5 space-y-2">
            {working.slice(0, maxPerColumn).map((moment, i) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                index={i}
                isExpanded={expandedId === moment.id}
                isActioned={actionedIds.has(moment.id)}
                onToggle={() => setExpandedId(prev => prev === moment.id ? null : moment.id)}
                onAction={() => handleAction(moment)}
              />
            ))}
            {working.length === 0 && (
              <p className="text-xs text-muted-foreground/50 text-center py-4">No positive signals yet</p>
            )}
          </div>
        </div>

        {/* What's Not Working */}
        <div className="p-4">
          <ColumnHeader label="WHAT'S NOT WORKING" dotColor="bg-red-500" count={notWorking.length} />
          <div className="mt-2.5 space-y-2">
            {notWorking.slice(0, maxPerColumn).map((moment, i) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                index={i}
                isExpanded={expandedId === moment.id}
                isActioned={actionedIds.has(moment.id)}
                onToggle={() => setExpandedId(prev => prev === moment.id ? null : moment.id)}
                onAction={() => handleAction(moment)}
              />
            ))}
            {notWorking.length === 0 && (
              <p className="text-xs text-muted-foreground/50 text-center py-4">Everything looks healthy</p>
            )}
          </div>
        </div>
      </div>

      {/* See more footer */}
      {(hasMore || onViewAll) && (
        <div className="px-5 py-3 border-t border-border/30 flex items-center justify-center">
          <button
            onClick={onViewAll}
            className="text-xs text-primary hover:underline font-medium"
          >
            See all {moments.length} recommendations →
          </button>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const ColumnHeader = ({ label, dotColor, count }: { label: string; dotColor: string; count: number }) => (
  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/20">
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", dotColor)} />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">{label}</span>
    </div>
    <span className="text-[10px] w-5 h-5 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center font-medium border border-border/30">
      {count}
    </span>
  </div>
);

const MomentCard = ({ moment, index, isExpanded, isActioned, onToggle, onAction }: {
  moment: KeyMoment;
  index: number;
  isExpanded: boolean;
  isActioned: boolean;
  onToggle: () => void;
  onAction: () => void;
}) => (
  <div
    className={cn(
      "rounded-xl border border-border/30 bg-card/60 overflow-hidden transition-all animate-fade-in",
      isExpanded && "border-primary/30",
      isActioned && "opacity-60"
    )}
    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
  >
    <div className="px-3 py-2.5 space-y-1.5">
      {/* Campaign + description */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{moment.campaignName}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{moment.description}</p>
        </div>
        <button onClick={onToggle} className="p-1 rounded hover:bg-muted/30 text-muted-foreground shrink-0">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Metric + risk + action */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {moment.metric && (
            <span className="text-[10px] text-muted-foreground">
              {moment.metric}{moment.metricValue ? `: ${moment.metricValue}` : ''}
            </span>
          )}
          <RiskBadge level={moment.riskLevel} />
        </div>
        {!isActioned ? (
          <ActionButton type={moment.actionType} label={moment.actionLabel} onClick={onAction} />
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Applied
          </span>
        )}
      </div>
    </div>

    {/* Expanded details */}
    {isExpanded && (moment.strategyLogic || moment.empiricalData) && (
      <div className="px-3 pb-3 pt-1 border-t border-border/20 animate-fade-in space-y-2">
        {moment.strategyLogic && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Strategy Logic</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{moment.strategyLogic}</p>
          </div>
        )}
        {moment.empiricalData && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Empirical Data</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{moment.empiricalData}</p>
          </div>
        )}
      </div>
    )}
  </div>
);

const RiskBadge = ({ level }: { level: string }) => {
  const colorMap: Record<string, string> = {
    'LOW RISK': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'MEDIUM RISK': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'HIGH RISK': 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return (
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border", colorMap[level] || colorMap['MEDIUM RISK'])}>
      {level}
    </span>
  );
};

const ActionButton = ({ type, label, onClick }: { type: string; label: string; onClick: () => void }) => {
  const styles: Record<string, { icon: typeof Play; className: string }> = {
    play: { icon: Play, className: 'border-primary/40 text-primary hover:bg-primary/10' },
    increase: { icon: TrendingUp, className: 'border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10' },
    decrease: { icon: TrendingDown, className: 'border-red-500/40 text-red-500 hover:bg-red-500/10' },
    pause: { icon: Pause, className: 'border-amber-500/40 text-amber-500 hover:bg-amber-500/10' },
  };
  const { icon: Icon, className } = styles[type] || styles.play;
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all active:scale-[0.97] shrink-0", className)}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
};
