import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Minus,
  ChevronDown,
  Sparkles,
  Calendar,
  DollarSign,
  Image,
  Target,
  Pause,
  Play
} from 'lucide-react';
import { TrackedAction } from './types';
import { useTrackedActions } from '@/hooks/useTrackedActions';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const categoryIcons = {
  budget: DollarSign,
  creative: Image,
  targeting: Target,
  schedule: Calendar,
  pause: Pause,
  resume: Play
};

const categoryColors = {
  budget: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  creative: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  targeting: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  schedule: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  pause: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  resume: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
};

const statusConfig = {
  monitoring: {
    icon: Clock,
    label: 'Monitoring',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30'
  },
  positive: {
    icon: CheckCircle2,
    label: 'Positive Impact',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30'
  },
  negative: {
    icon: XCircle,
    label: 'Needs Review',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30'
  },
  neutral: {
    icon: Minus,
    label: 'No Change',
    color: 'text-muted-foreground',
    bg: 'bg-muted/20',
    border: 'border-border/50'
  }
};

const formatTimeAgo = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
};

interface ActionCardProps {
  action: TrackedAction;
}

const ActionCard = ({ action }: ActionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const CategoryIcon = categoryIcons[action.category];
  const statusInfo = statusConfig[action.status];
  const StatusIcon = statusInfo.icon;
  const categoryStyle = categoryColors[action.category];

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "w-full text-left p-3 rounded-lg border transition-all cursor-pointer group",
            statusInfo.bg,
            statusInfo.border,
            isExpanded && "ring-1 ring-primary/30"
          )}
        >
          <div className="flex items-start gap-3">
            {/* Category Icon */}
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border shrink-0",
              categoryStyle
            )}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon className={cn("w-3.5 h-3.5", statusInfo.color)} />
                <span className={cn("text-[10px] font-medium uppercase tracking-wider", statusInfo.color)}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                {action.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(action.appliedAt)}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-primary/70">
                  {action.monitoringPeriod} monitoring
                </span>
              </div>
            </div>
            
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0",
              isExpanded && "rotate-180"
            )} />
          </div>
        </button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2 animate-fade-in">
        <div className={cn(
          "rounded-lg border p-3 space-y-3",
          statusInfo.bg,
          statusInfo.border
        )}>
          {/* Expected vs Actual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded-md bg-background/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Expected
              </p>
              <p className="text-sm font-medium text-foreground">
                {action.expectedImpact}
              </p>
            </div>
            
            {action.actualImpact ? (
              <div className="p-2 rounded-md bg-background/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Actual Result
                </p>
                <div className="flex items-center gap-1.5">
                  {action.actualImpact.direction === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : action.actualImpact.direction === 'down' ? (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  ) : null}
                  <span className={cn(
                    "text-sm font-medium",
                    action.actualImpact.direction === 'up' ? "text-emerald-400" : 
                    action.actualImpact.direction === 'down' ? "text-rose-400" : 
                    "text-foreground"
                  )}>
                    {action.actualImpact.change}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-md bg-background/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Status
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    Collecting data...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Metric Details */}
          {action.actualImpact && (
            <div className="p-2 rounded-md bg-background/30 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">
                {action.actualImpact.metric}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{action.actualImpact.before}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium text-foreground">{action.actualImpact.after}</span>
              </div>
            </div>
          )}

          {/* Confidence Badge */}
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground">
              {action.confidence}% confidence in recommendation
            </span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ActionsImpactPanel = () => {
  const { trackedActions, getSummary } = useTrackedActions();
  const summary = getSummary();

  if (trackedActions.length === 0) return null;

  return (
    <div className="w-80 shrink-0">
      <div className="sticky top-24">
        <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Actions Impact</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {summary.total}
              </span>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-3 mt-2">
              {summary.monitoring > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-muted-foreground">{summary.monitoring} monitoring</span>
                </div>
              )}
              {summary.positive > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-muted-foreground">{summary.positive} positive</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions List */}
          <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {trackedActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
