import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronUp,
  X,
  Sparkles,
  History
} from 'lucide-react';
import { TrackedAction } from './types';
import { useTrackedActions } from '@/hooks/useTrackedActions';
import { Button } from '@/components/ui/button';

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

interface ActionItemProps {
  action: TrackedAction;
}

const ActionItem = ({ action }: ActionItemProps) => {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border transition-all",
      action.status === 'monitoring' && "bg-blue-500/5 border-blue-500/20",
      action.status === 'positive' && "bg-emerald-500/5 border-emerald-500/20",
      action.status === 'negative' && "bg-rose-500/5 border-rose-500/20",
      action.status === 'neutral' && "bg-muted/20 border-border/50"
    )}>
      {/* Status Icon */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        action.status === 'monitoring' && "bg-blue-500/10",
        action.status === 'positive' && "bg-emerald-500/10",
        action.status === 'negative' && "bg-rose-500/10",
        action.status === 'neutral' && "bg-muted/30"
      )}>
        {action.status === 'monitoring' && <Clock className="w-4 h-4 text-blue-400" />}
        {action.status === 'positive' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        {action.status === 'negative' && <XCircle className="w-4 h-4 text-rose-400" />}
        {action.status === 'neutral' && <Activity className="w-4 h-4 text-muted-foreground" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{action.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatTimeAgo(action.appliedAt)}</span>
          {action.actualImpact ? (
            <span className={cn(
              "text-xs font-medium flex items-center gap-0.5",
              action.actualImpact.direction === 'up' && "text-emerald-400",
              action.actualImpact.direction === 'down' && "text-rose-400"
            )}>
              {action.actualImpact.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {action.actualImpact.change}
            </span>
          ) : (
            <span className="text-xs text-blue-400 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Monitoring
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ActionsImpactBadge = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { trackedActions, getSummary } = useTrackedActions();
  const summary = getSummary();

  const handleViewHistory = () => {
    setIsExpanded(false);
    navigate('/actions-history');
  };

  if (trackedActions.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-14 right-0 w-80 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Your Actions Impact</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0"
                onClick={() => setIsExpanded(false)}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tracking results from your applied recommendations
            </p>
          </div>

          {/* Summary Stats */}
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-4">
            {summary.monitoring > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-muted-foreground">{summary.monitoring} monitoring</span>
              </div>
            )}
            {summary.positive > 0 && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-muted-foreground">{summary.positive} positive</span>
              </div>
            )}
            {summary.negative > 0 && (
              <div className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs text-muted-foreground">{summary.negative} needs review</span>
              </div>
            )}
          </div>

          {/* Actions List */}
          <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
            {trackedActions.slice(0, 5).map((action) => (
              <ActionItem key={action.id} action={action} />
            ))}
            {trackedActions.length > 5 && (
              <p className="text-xs text-center text-muted-foreground py-2">
                +{trackedActions.length - 5} more actions
              </p>
            )}
          </div>

          {/* Footer with View All History */}
          <div className="px-4 py-2.5 border-t border-border/30 bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">
                Monitoring your applied recommendations
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewHistory}
              className="h-6 px-2 text-xs text-primary hover:text-primary gap-1"
            >
              <History className="w-3 h-3" />
              View All
            </Button>
          </div>
        </div>
      )}

      {/* Mini Badge Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200",
          "bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
          isExpanded 
            ? "border-primary/30 ring-1 ring-primary/20" 
            : "border-border/50 hover:border-primary/30",
          "hover:scale-105 active:scale-100"
        )}
      >
        <div className="relative">
          <Activity className="w-4 h-4 text-primary" />
          {summary.monitoring > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          )}
        </div>
        <span className="text-xs font-medium text-foreground">
          {summary.monitoring > 0 
            ? `${summary.monitoring} monitoring`
            : `${summary.total} tracked`
          }
        </span>
        <ChevronUp className={cn(
          "w-3 h-3 text-muted-foreground transition-transform duration-200",
          isExpanded ? "rotate-180" : "rotate-0"
        )} />
      </button>
    </div>
  );
};
