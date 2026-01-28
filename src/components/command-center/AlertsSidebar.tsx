import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Target,
  Sparkles,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { LiveAlert } from './types';

interface AlertCardProps {
  alert: LiveAlert;
  isCompact?: boolean;
}

const AlertCard = ({ alert, isCompact }: AlertCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <button 
          className={cn(
            "w-full text-left p-3 rounded-lg border transition-all cursor-pointer group",
            alert.type === 'positive' 
              ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10" 
              : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10",
            isExpanded && "ring-1 ring-primary/30"
          )}
        >
          <div className="flex items-start gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse",
              alert.type === 'positive' ? "bg-emerald-400" : "bg-amber-400"
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                {alert.message}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{alert.time}</span>
                <span className={cn(
                  "text-xs font-medium",
                  alert.type === 'positive' ? "text-emerald-400" : "text-amber-400"
                )}>
                  {alert.change}
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
          alert.type === 'positive' 
            ? "bg-emerald-500/5 border-emerald-500/20" 
            : "bg-amber-500/5 border-amber-500/20"
        )}>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {alert.details}
          </p>
          
          {/* Suggested Action */}
          <div className={cn(
            "rounded-lg border p-3",
            alert.type === 'positive' 
              ? "bg-emerald-500/10 border-emerald-500/30" 
              : "bg-amber-500/10 border-amber-500/30"
          )}>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className={cn(
                "w-3 h-3",
                alert.type === 'positive' ? "text-emerald-400" : "text-amber-400"
              )} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Suggested
              </span>
            </div>
            <p className="text-xs font-medium text-foreground mb-1">
              {alert.suggestedAction.title}
            </p>
            <div className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
              alert.type === 'positive' 
                ? "bg-emerald-500/20 text-emerald-300" 
                : "bg-amber-500/20 text-amber-300"
            )}>
              <Target className="w-2.5 h-2.5" />
              {alert.suggestedAction.impact}
            </div>
          </div>
          
          <Button 
            size="sm" 
            className={cn(
              "w-full text-xs",
              alert.type === 'positive'
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            )}
          >
            Apply Now
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface AlertsSidebarProps {
  alerts: LiveAlert[];
}

export const AlertsSidebar = ({ alerts }: AlertsSidebarProps) => {
  if (alerts.length === 0) return null;

  return (
    <div className="w-80 shrink-0">
      <div className="sticky top-24">
        <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">What's Happening Now</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {alerts.length}
              </span>
            </div>
          </div>
          
          {/* Alerts List */}
          <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} isCompact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
