import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Sparkles,
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { TrendingChange, QuickWin } from './types';

interface TrendCardProps {
  change: TrendingChange;
}

const TrendCard = ({ change }: TrendCardProps) => {
  const isPositive = change.direction === 'up' && !change.metric.toLowerCase().includes('cost');
  const isNegative = change.direction === 'down' && change.metric.toLowerCase().includes('cost');
  const isGood = isPositive || isNegative;
  
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      isGood 
        ? "bg-emerald-500/5 border-emerald-500/20" 
        : "bg-amber-500/5 border-amber-500/20"
    )}>
      <div className="flex items-start gap-2">
        <div className={cn(
          "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
          isGood ? "bg-emerald-500/10" : "bg-amber-500/10"
        )}>
          {change.direction === 'up' ? (
            <TrendingUp className={cn("w-3 h-3", isGood ? "text-emerald-400" : "text-amber-400")} />
          ) : (
            <TrendingDown className={cn("w-3 h-3", isGood ? "text-emerald-400" : "text-amber-400")} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground">{change.metric}</p>
            <span className={cn(
              "text-xs font-bold",
              isGood ? "text-emerald-400" : "text-amber-400"
            )}>
              {change.change}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{change.context}</p>
        </div>
      </div>
    </div>
  );
};

interface QuickWinCardProps {
  win: QuickWin;
}

const QuickWinCard = ({ win }: QuickWinCardProps) => (
  <div className="p-3 rounded-lg border bg-primary/5 border-primary/20 transition-all hover:bg-primary/10">
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Zap className="w-3 h-3 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground line-clamp-2">{win.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-primary font-medium">{win.impact}</span>
          <span className="text-[10px] text-muted-foreground">• {win.timeToApply}</span>
        </div>
      </div>
    </div>
  </div>
);

interface InsightsSidebarProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  changes?: TrendingChange[];
  quickWins?: QuickWin[];
  emptyMessage?: string;
}

export const InsightsSidebar = ({ 
  title, 
  subtitle,
  icon,
  changes = [], 
  quickWins = [],
  emptyMessage = "No insights available"
}: InsightsSidebarProps) => {
  const hasContent = changes.length > 0 || quickWins.length > 0;

  return (
    <div className="w-80 shrink-0">
      <div className="sticky top-24">
        <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon || <Sparkles className="w-4 h-4 text-primary" />}
                <span className="text-sm font-semibold text-foreground">{title}</span>
              </div>
              {(changes.length + quickWins.length) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {changes.length + quickWins.length}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          
          {/* Content */}
          <div className="p-3 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {!hasContent ? (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{emptyMessage}</p>
              </div>
            ) : (
              <>
                {/* Trending Changes */}
                {changes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 px-1">
                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Trends
                      </span>
                    </div>
                    {changes.map((change) => (
                      <TrendCard key={change.id} change={change} />
                    ))}
                  </div>
                )}
                
                {/* Quick Wins */}
                {quickWins.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 px-1">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Quick Actions
                      </span>
                    </div>
                    {quickWins.map((win) => (
                      <QuickWinCard key={win.id} win={win} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
