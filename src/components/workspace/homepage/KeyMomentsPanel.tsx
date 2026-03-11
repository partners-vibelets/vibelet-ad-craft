import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Play, TrendingUp, TrendingDown, Pause, Info, CheckCircle2, XCircle } from 'lucide-react';
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
}

export const KeyMomentsPanel = ({ moments, potentialSavings, onAction, onViewAll }: KeyMomentsPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());

  const working = moments.filter(m => m.category === 'working');
  const notWorking = moments.filter(m => m.category === 'not_working');

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
          {onViewAll && (
            <button onClick={onViewAll} className="text-[11px] text-primary hover:underline">
              View all
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* What's Working */}
        {working.length > 0 && (
          <MomentSection
            label="WHAT'S WORKING"
            dotColor="bg-emerald-500"
            count={working.length}
            moments={working}
            expandedId={expandedId}
            actionedIds={actionedIds}
            onToggle={id => setExpandedId(prev => prev === id ? null : id)}
            onAction={handleAction}
          />
        )}

        {/* What's Not Working */}
        {notWorking.length > 0 && (
          <MomentSection
            label="WHAT'S NOT WORKING"
            dotColor="bg-red-500"
            count={notWorking.length}
            moments={notWorking}
            expandedId={expandedId}
            actionedIds={actionedIds}
            onToggle={id => setExpandedId(prev => prev === id ? null : id)}
            onAction={handleAction}
          />
        )}
      </div>
    </div>
  );
};

const MomentSection = ({ label, dotColor, count, moments, expandedId, actionedIds, onToggle, onAction }: {
  label: string;
  dotColor: string;
  count: number;
  moments: KeyMoment[];
  expandedId: string | null;
  actionedIds: Set<string>;
  onToggle: (id: string) => void;
  onAction: (m: KeyMoment) => void;
}) => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", dotColor)} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">{label}</span>
      </div>
      <span className="text-[10px] w-5 h-5 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center font-medium border border-border/30">
        {count}
      </span>
    </div>

    {moments.map((moment, i) => {
      const isExpanded = expandedId === moment.id;
      const isActioned = actionedIds.has(moment.id);

      return (
        <div
          key={moment.id}
          className={cn(
            "rounded-xl border border-border/30 bg-card/60 overflow-hidden transition-all animate-fade-in",
            isExpanded && "border-primary/30",
            isActioned && "opacity-60"
          )}
          style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
        >
          {/* Main row */}
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Campaign icon */}
            <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-muted-foreground">C</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{moment.campaignName}</span>
                <span className="text-sm text-muted-foreground">- {moment.description}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  ↗ {moment.metric}: {moment.metricValue}
                </span>
                <RiskBadge level={moment.riskLevel} />
                <button className="text-muted-foreground/50 hover:text-muted-foreground">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expand toggle */}
            <button
              onClick={() => onToggle(moment.id)}
              className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground transition-colors shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Action button */}
            {!isActioned ? (
              <ActionButton type={moment.actionType} label={moment.actionLabel} onClick={() => onAction(moment)} />
            ) : (
              <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Applied
              </div>
            )}
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-border/20 animate-fade-in">
              <div className="grid grid-cols-2 gap-3 mt-2">
                {moment.strategyLogic && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Strategy Logic</p>
                    </div>
                    <p className="text-xs font-medium text-foreground">Why we suggest this</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{moment.strategyLogic}</p>
                  </div>
                )}
                {moment.empiricalData && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Empirical Data</p>
                    </div>
                    <p className="text-xs font-medium text-foreground">How we know</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{moment.empiricalData}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

const RiskBadge = ({ level }: { level: string }) => {
  const colorMap: Record<string, string> = {
    'LOW RISK': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'MEDIUM RISK': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'HIGH RISK': 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <span className={cn(
      "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
      colorMap[level] || colorMap['MEDIUM RISK']
    )}>
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
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-medium transition-all active:scale-[0.97] shrink-0",
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
};
