import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  ChevronDown,
  Play,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { LiveAlert } from './types';

interface LiveAlertCardProps {
  alert: LiveAlert;
}

const LiveAlertCard = ({ alert }: LiveAlertCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <button 
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer group",
            alert.type === 'positive' 
              ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15" 
              : "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15",
            isExpanded && "ring-2 ring-primary/30"
          )}
        >
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse shrink-0",
            alert.type === 'positive' ? "bg-emerald-400" : "bg-amber-400"
          )} />
          <span className="text-sm font-medium text-foreground">{alert.message}</span>
          <span className="text-xs text-muted-foreground">{alert.time}</span>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200 ml-1",
            isExpanded && "rotate-180"
          )} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 animate-fade-in">
        <div className={cn(
          "rounded-xl border p-4 space-y-4 transition-all duration-300",
          alert.type === 'positive' 
            ? "bg-emerald-500/5 border-emerald-500/20" 
            : "bg-amber-500/5 border-amber-500/20"
        )}>
          {/* Metric Change */}
          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-transform duration-200 hover:scale-105",
              alert.type === 'positive' ? "bg-emerald-500/10" : "bg-amber-500/10"
            )}>
              <span className="text-xs text-muted-foreground">{alert.metric}</span>
              <span className={cn(
                "text-sm font-bold",
                alert.type === 'positive' ? "text-emerald-400" : "text-amber-400"
              )}>
                {alert.change}
              </span>
            </div>
            {alert.type === 'positive' ? (
              <TrendingUp className="w-4 h-4 text-emerald-400 animate-fade-in" style={{ animationDelay: '100ms' }} />
            ) : (
              <TrendingDown className="w-4 h-4 text-amber-400 animate-fade-in" style={{ animationDelay: '100ms' }} />
            )}
          </div>
          
          {/* Details */}
          <p className="text-sm text-muted-foreground leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
            {alert.details}
          </p>
          
          {/* Suggested Action */}
          <div className={cn(
            "rounded-lg border p-4 animate-fade-in transition-all duration-200 hover:shadow-lg",
            alert.type === 'positive' 
              ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50" 
              : "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50"
          )} style={{ animationDelay: '150ms' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className={cn(
                    "w-4 h-4",
                    alert.type === 'positive' ? "text-emerald-400" : "text-amber-400"
                  )} />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    What You Can Do
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {alert.suggestedAction.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {alert.suggestedAction.description}
                </p>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
                  alert.type === 'positive' 
                    ? "bg-emerald-500/20 text-emerald-300" 
                    : "bg-amber-500/20 text-amber-300"
                )}>
                  <Target className="w-3 h-3" />
                  Expected result: {alert.suggestedAction.impact}
                </div>
              </div>
              <Button 
                size="sm" 
                className={cn(
                  "shrink-0",
                  alert.type === 'positive'
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                )}
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Apply
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface LiveAlertsSectionProps {
  alerts: LiveAlert[];
  title?: string;
}

export const LiveAlertsSection = ({ alerts, title = "What's Happening Now" }: LiveAlertsSectionProps) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Zap className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium uppercase tracking-wider">{title}</span>
        <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
          {alerts.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {alerts.map((alert) => (
          <LiveAlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
};
