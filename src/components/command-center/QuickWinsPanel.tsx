import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Zap, 
  Clock, 
  DollarSign, 
  Image, 
  Target, 
  Calendar,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickWin } from './types';
import { useTrackedActions } from '@/hooks/useTrackedActions';

const categoryConfig = {
  budget: {
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  creative: {
    icon: Image,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  targeting: {
    icon: Target,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20'
  },
  schedule: {
    icon: Calendar,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20'
  }
};

interface QuickWinsPanelProps {
  quickWins: QuickWin[];
  title?: string;
}

export const QuickWinsPanel = ({ quickWins, title = "Quick Wins" }: QuickWinsPanelProps) => {
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { trackAction } = useTrackedActions();

  const handleApply = async (win: QuickWin) => {
    setLoadingId(win.id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Track this action for monitoring
    trackAction(
      win.id,
      'quick_win',
      win.title,
      win.category,
      win.impact,
      win.confidence,
      '7 days'
    );
    
    setAppliedIds(prev => [...prev, win.id]);
    setLoadingId(null);
  };

  if (quickWins.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
          {quickWins.length}
        </span>
      </div>

      <div className="space-y-2">
        {quickWins.map((win) => {
          const config = categoryConfig[win.category];
          const IconComponent = config.icon;
          const isApplied = appliedIds.includes(win.id);
          const isLoading = loadingId === win.id;

          return (
            <div 
              key={win.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                isApplied 
                  ? "bg-emerald-500/5 border-emerald-500/20" 
                  : "bg-card/50 border-border/50 hover:border-primary/20 hover:bg-card/80"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  config.bg, config.border, "border"
                )}>
                  <IconComponent className={cn("w-5 h-5", config.color)} />
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    isApplied ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {win.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-emerald-400 font-medium">
                      {win.impact}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {win.timeToApply}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant={isApplied ? "ghost" : "default"}
                disabled={isApplied || isLoading}
                onClick={() => handleApply(win)}
                className={cn(
                  isApplied && "text-emerald-400"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isApplied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Applied
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
