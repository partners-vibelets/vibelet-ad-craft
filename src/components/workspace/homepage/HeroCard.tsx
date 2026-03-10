import { Facebook, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroCardProps {
  connectedFacebook: boolean;
  primaryAction?: { label: string; rationale: string; icon: string; action: string };
  onConnectFacebook: () => void;
  onStartTour: () => void;
  onPrimaryAction: (action: string) => void;
}

export const HeroCard = ({
  connectedFacebook, primaryAction, onConnectFacebook, onStartTour, onPrimaryAction,
}: HeroCardProps) => {
  if (!connectedFacebook) {
    return (
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-card to-card p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Facebook className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">Connect Facebook to unlock live reporting & publishing</h2>
            <p className="text-sm text-muted-foreground">Link your Meta ad account to get real-time performance data, AI-powered recommendations, and one-click publishing.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onConnectFacebook}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98] shadow-md"
          >
            <Facebook className="w-4 h-4" />
            Connect Facebook in 2 minutes
          </button>
          <button
            onClick={onStartTour}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
          >
            Start with sample campaign
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (!primaryAction) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-secondary/5 via-card to-card p-5 space-y-3">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Top recommended action</p>
          <h2 className="text-base font-semibold text-foreground">{primaryAction.icon} {primaryAction.label}</h2>
          <p className="text-sm text-muted-foreground">{primaryAction.rationale}</p>
        </div>
        <button
          onClick={() => onPrimaryAction(primaryAction.action)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98] shadow-sm shrink-0"
        >
          Take action
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
