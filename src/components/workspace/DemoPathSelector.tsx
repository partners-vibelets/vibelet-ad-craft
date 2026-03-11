import { useState } from 'react';
import { UserPlus, TrendingDown, FileEdit, RefreshCw, Zap, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserState } from '@/hooks/useUserState';

interface DemoPath {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  bgAccent: string;
  tags: string[];
  stateOverride: Partial<UserState>;
}

const demoPaths: DemoPath[] = [
  {
    id: 'new-user',
    title: 'New User (No Facebook)',
    description: 'First-time visitor — no ad account connected, no campaigns. Sees onboarding prompts, sample data, and connect CTA.',
    icon: UserPlus,
    iconColor: 'text-primary',
    bgAccent: 'from-primary/8 to-primary/3',
    tags: ['Onboarding', 'Connect Flow', 'Sample Data'],
    stateOverride: {
      connected_facebook: false,
      has_published_campaign: false,
      has_draft: false,
      onboarding_answers: null,
      paused_alerts: [],
      apps: { slack_connected: false },
    },
  },
  {
    id: 'connected-negative-cpa',
    title: 'Connected — High CPA Alert',
    description: 'Returning user with Facebook connected. CPA has spiked 50%+ — AI recommends pausing underperformers and regenerating creatives.',
    icon: TrendingDown,
    iconColor: 'text-amber-500',
    bgAccent: 'from-amber-500/8 to-amber-500/3',
    tags: ['AI Signals', 'Micro-Actions', 'Performance'],
    stateOverride: {
      connected_facebook: true,
      has_published_campaign: true,
      has_draft: false,
      onboarding_answers: { top_objective: 'sales', monthly_budget_range: '$500-2500', role: 'founder', ai_autonomy: 'assistive' },
      paused_alerts: [],
      apps: { slack_connected: false },
      last_active: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    },
  },
  {
    id: 'draft-ready',
    title: 'Returning — Draft Ready to Publish',
    description: 'User completed onboarding and has a campaign draft waiting. Primary action is "Publish draft campaign" with one click.',
    icon: FileEdit,
    iconColor: 'text-secondary',
    bgAccent: 'from-secondary/8 to-secondary/3',
    tags: ['Publish Flow', 'Draft Campaign', 'One-Click'],
    stateOverride: {
      connected_facebook: true,
      has_published_campaign: false,
      has_draft: true,
      onboarding_answers: { top_objective: 'leads', monthly_budget_range: '$2.5k-10k', role: 'performance_marketer', generate_now: true, ai_autonomy: 'assistive' },
      paused_alerts: [],
      apps: { slack_connected: true },
    },
  },
  {
    id: 'active-optimizer',
    title: 'Power User — Active Optimizer',
    description: 'Experienced user with published campaigns, connected integrations, and multiple alerts. Focused on budget scaling and creative refresh.',
    icon: Zap,
    iconColor: 'text-purple-500',
    bgAccent: 'from-purple-500/8 to-purple-500/3',
    tags: ['Budget Scaling', 'Creative Refresh', 'Multi-Campaign'],
    stateOverride: {
      connected_facebook: true,
      has_published_campaign: true,
      has_draft: true,
      onboarding_answers: { objective: 'sales', monthly_budget: '>$10k', platforms: ['Facebook', 'Instagram', 'TikTok'], audience: 'lookalike', style: 'demo' },
      paused_alerts: ['alert-ctr'],
      apps: { slack_connected: true },
    },
  },
  {
    id: 'returning-stale',
    title: 'Returning — Inactive for 7 Days',
    description: 'User hasn\'t logged in for a week. Performance has shifted. Homepage surfaces "While you were away" summary and urgent signals.',
    icon: RefreshCw,
    iconColor: 'text-rose-500',
    bgAccent: 'from-rose-500/8 to-rose-500/3',
    tags: ['Re-engagement', 'Catch-up', 'Performance Shifts'],
    stateOverride: {
      connected_facebook: true,
      has_published_campaign: true,
      has_draft: false,
      onboarding_answers: { objective: 'awareness', monthly_budget: '$500-2.5k', platforms: ['Facebook', 'Instagram'], audience: 'existing_customers', style: 'UGC' },
      paused_alerts: [],
      apps: { slack_connected: false },
      last_active: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
];

interface DemoPathSelectorProps {
  onSelectPath: (stateOverride: Partial<UserState>) => void;
  onSkip: () => void;
}

export const DemoPathSelector = ({ onSelectPath, onSkip }: DemoPathSelectorProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/30 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Demo Path Selector</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose a user scenario to preview the homepage experience
          </p>
        </div>
        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Use current state
        </button>
      </div>

      {/* Paths grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoPaths.map((path, i) => (
              <button
                key={path.id}
                onClick={() => onSelectPath(path.stateOverride)}
                onMouseEnter={() => setHoveredId(path.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "flex flex-col text-left rounded-2xl border p-5 space-y-3.5 transition-all duration-200 animate-fade-in",
                  "hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]",
                  hoveredId === path.id
                    ? "border-primary/40 shadow-md"
                    : "border-border/50 bg-card/80"
                )}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
              >
                {/* Icon + Title */}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br",
                    path.bgAccent
                  )}>
                    <path.icon className={cn("w-5 h-5", path.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{path.title}</h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">{path.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {path.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border/30 text-muted-foreground font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary pt-1">
                  Enter this flow
                  <ArrowRight className={cn(
                    "w-3.5 h-3.5 transition-transform",
                    hoveredId === path.id ? "translate-x-1" : ""
                  )} />
                </div>
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <p className="text-center text-[11px] text-muted-foreground/60 mt-8">
            Each path simulates a different user state. All data is client-side — no backend required.
          </p>
        </div>
      </div>
    </div>
  );
};
