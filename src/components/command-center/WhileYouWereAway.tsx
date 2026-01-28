import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  X,
  Zap,
  AlertTriangle,
  DollarSign,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AwayChange {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  category: 'spend' | 'performance' | 'alert' | 'action';
  title: string;
  detail: string;
  change?: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

// Storage key for last visit time
const LAST_VISIT_KEY = 'vibelets_command_center_last_visit';
const MIN_AWAY_TIME_MS = 5 * 60 * 1000; // 5 minutes minimum to show "while away"

// Mock changes that happened while away
const generateMockChanges = (awayMinutes: number): AwayChange[] => {
  const changes: AwayChange[] = [];
  const now = new Date();
  
  // Generate changes based on how long they were away
  if (awayMinutes >= 5) {
    changes.push({
      id: 'away-1',
      type: 'positive',
      category: 'performance',
      title: 'Summer Sale campaign picked up momentum',
      detail: 'Conversion rate increased by 18% in the last hour',
      change: '+18%',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000),
      priority: 'medium'
    });
  }
  
  if (awayMinutes >= 15) {
    changes.push({
      id: 'away-2',
      type: 'negative',
      category: 'alert',
      title: 'CPC spiked on "Product Demo" ad set',
      detail: 'Cost per click went from ₹2.40 to ₹4.10',
      change: '+71%',
      timestamp: new Date(now.getTime() - 20 * 60 * 1000),
      priority: 'high'
    });
  }
  
  if (awayMinutes >= 30) {
    changes.push({
      id: 'away-3',
      type: 'positive',
      category: 'spend',
      title: 'Daily budget optimized automatically',
      detail: 'Reallocated ₹200 from low-performers to top ads',
      timestamp: new Date(now.getTime() - 35 * 60 * 1000),
      priority: 'low'
    });
  }
  
  if (awayMinutes >= 60) {
    changes.push({
      id: 'away-4',
      type: 'neutral',
      category: 'action',
      title: 'New AI recommendation available',
      detail: 'Pause 2 underperforming creatives to save ₹150/day',
      timestamp: new Date(now.getTime() - 50 * 60 * 1000),
      priority: 'medium'
    });
  }
  
  // Sort by priority and timestamp
  return changes.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

const formatAwayDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
};

const getCategoryIcon = (category: AwayChange['category']) => {
  switch (category) {
    case 'spend': return DollarSign;
    case 'performance': return TrendingUp;
    case 'alert': return AlertTriangle;
    case 'action': return Target;
    default: return Zap;
  }
};

export const WhileYouWereAway = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [changes, setChanges] = useState<AwayChange[]>([]);
  const [awayDuration, setAwayDuration] = useState(0);
  const [returnTime] = useState(new Date());

  useEffect(() => {
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    
    if (lastVisit) {
      const lastVisitTime = new Date(lastVisit);
      const awayMs = Date.now() - lastVisitTime.getTime();
      const awayMinutes = Math.floor(awayMs / 60000);
      
      if (awayMs >= MIN_AWAY_TIME_MS) {
        setAwayDuration(awayMinutes);
        setChanges(generateMockChanges(awayMinutes));
        setIsVisible(true);
      }
    }
    
    // Update last visit time
    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    
    // Also update on visibility change (when user leaves/returns)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || changes.length === 0) return null;

  return (
    <div className="mb-6 animate-fade-in">
      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 via-background to-primary/5 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-primary/20 bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">While You Were Away</h3>
              <p className="text-xs text-muted-foreground">
                You were gone for {formatAwayDuration(awayDuration)} • Returned at {returnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {changes.length} update{changes.length > 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Changes List */}
        <div className="p-4">
          <div className="space-y-3">
            {changes.map((change) => {
              const IconComponent = getCategoryIcon(change.category);
              return (
                <div 
                  key={change.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    change.priority === 'high' 
                      ? "bg-amber-500/5 border-amber-500/20" 
                      : "bg-card/50 border-border/50 hover:bg-card/80"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    change.type === 'positive' && "bg-emerald-500/10",
                    change.type === 'negative' && "bg-amber-500/10",
                    change.type === 'neutral' && "bg-muted"
                  )}>
                    <IconComponent className={cn(
                      "w-4 h-4",
                      change.type === 'positive' && "text-emerald-400",
                      change.type === 'negative' && "text-amber-400",
                      change.type === 'neutral' && "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{change.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{change.detail}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {change.change && (
                          <span className={cn(
                            "flex items-center gap-0.5 text-xs font-medium",
                            change.type === 'positive' && "text-emerald-400",
                            change.type === 'negative' && "text-amber-400"
                          )}>
                            {change.type === 'positive' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {change.change}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(change.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Most important changes shown first
            </p>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={handleDismiss}>
              Got it, dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
