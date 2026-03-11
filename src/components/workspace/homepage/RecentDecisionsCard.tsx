import { CheckCircle2, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RecentDecision {
  id: string;
  title: string;
  details: string;
  confidence: number;
  daysAgo: number;
}

interface RecentDecisionsCardProps {
  decisions: RecentDecision[];
  notificationCount?: number;
}

export const RecentDecisionsCard = ({ decisions, notificationCount = 0 }: RecentDecisionsCardProps) => {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">Recent Updates</h3>
        </div>
        <span className="text-[10px] w-5 h-5 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center font-medium border border-border/30">
          {notificationCount}
        </span>
      </div>

      <div className="p-4">
        {decisions.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 text-center py-3">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {decisions.map((decision, i) => (
              <div
                key={decision.id}
                className="flex gap-3 animate-fade-in"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/30 bg-card" />
                  {i < decisions.length - 1 && <div className="w-px flex-1 bg-border/30 mt-1" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-foreground">{decision.title}</h4>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {decision.daysAgo === 0 ? 'Today' : `${decision.daysAgo}d ago`}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{decision.details}</p>
                  <p className="text-[10px] text-primary mt-1">Conf: {decision.confidence}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
