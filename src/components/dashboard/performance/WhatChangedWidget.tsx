import { PerformanceChange } from '@/types/campaign';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TrendingUp, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatChangedWidgetProps {
  changes: PerformanceChange[];
}

const categoryConfig = {
  good: {
    icon: TrendingUp,
    label: 'Good News',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10'
  },
  attention: {
    icon: AlertTriangle,
    label: 'Needs Attention',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  steady: {
    icon: ArrowRight,
    label: 'Steady',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50'
  },
  'action-taken': {
    icon: CheckCircle,
    label: 'Action Taken',
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  }
};

export const WhatChangedWidget = ({ changes }: WhatChangedWidgetProps) => {
  const goodChanges = changes.filter(c => c.category === 'good');
  const attentionChanges = changes.filter(c => c.category === 'attention');
  const steadyChanges = changes.filter(c => c.category === 'steady');
  const actionChanges = changes.filter(c => c.category === 'action-taken');

  const groupedChanges = [
    { category: 'good' as const, changes: goodChanges },
    { category: 'attention' as const, changes: attentionChanges },
    { category: 'steady' as const, changes: steadyChanges },
    { category: 'action-taken' as const, changes: actionChanges }
  ].filter(g => g.changes.length > 0);

  if (changes.length === 0) {
    return (
      <div className="p-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">What Changed</h4>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">No recent changes to report</p>
        </div>
      </div>
    );
  }

  // Preview text for collapsed state
  const previewItems = changes.slice(0, 2);

  return (
    <div className="p-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">What Changed</h4>
      
      <div className="glass-card rounded-xl overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="changes" className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
              <div className="flex items-center gap-2 text-left">
                <span className="text-sm font-medium">Recent Updates</span>
                <span className="text-xs text-muted-foreground">
                  ({changes.length} item{changes.length !== 1 ? 's' : ''})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {groupedChanges.map((group) => {
                  const config = categoryConfig[group.category];
                  const Icon = config.icon;

                  return (
                    <div key={group.category} className="space-y-2">
                      <div className={cn("flex items-center gap-2 px-2 py-1 rounded", config.bgColor)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                        <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
                      </div>
                      {group.changes.map((change, index) => (
                        <div 
                          key={change.id}
                          className="pl-6 animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <p className="text-sm font-medium text-foreground">{change.title}</p>
                          <p className="text-xs text-muted-foreground">{change.description}</p>
                          {change.metric && change.change && (
                            <span className={cn("text-xs font-medium", config.color)}>
                              {change.metric}: {change.change}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
