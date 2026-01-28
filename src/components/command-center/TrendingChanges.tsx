import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { TrendingChange } from './types';

interface TrendingChangesProps {
  changes: TrendingChange[];
}

export const TrendingChanges = ({ changes }: TrendingChangesProps) => {
  if (changes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          What's Trending
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {changes.map((change) => {
          const isPositive = 
            (change.direction === 'up' && !change.metric.toLowerCase().includes('cost')) ||
            (change.direction === 'down' && change.metric.toLowerCase().includes('cost'));

          return (
            <div 
              key={change.id}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]",
                isPositive 
                  ? "bg-emerald-500/5 border-emerald-500/20" 
                  : "bg-amber-500/5 border-amber-500/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{change.metric}</span>
                {change.direction === 'up' ? (
                  <TrendingUp className={cn(
                    "w-4 h-4",
                    isPositive ? "text-emerald-400" : "text-amber-400"
                  )} />
                ) : (
                  <TrendingDown className={cn(
                    "w-4 h-4",
                    isPositive ? "text-emerald-400" : "text-amber-400"
                  )} />
                )}
              </div>
              <p className={cn(
                "text-xl font-bold mb-1",
                isPositive ? "text-emerald-400" : "text-amber-400"
              )}>
                {change.change}
              </p>
              <p className="text-xs text-muted-foreground">{change.context}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{change.since}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
