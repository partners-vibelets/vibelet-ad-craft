import { useState, useRef, useCallback, useMemo } from 'react';
import { ArrowUp, Sparkles, HelpCircle, BookOpen, Mail, Rocket, Video, ImageIcon, Upload, Search, Link2, FileEdit, Zap, Play, TrendingDown, AlertTriangle, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingData } from '@/components/workspace/OnboardingFlow';
import { useUserState, OnboardingAnswers } from '@/hooks/useUserState';
import { demoKPIs, generateAlerts, computePrimaryAction, generateCampaignDraft, demoKeyMoments, demoRecentDecisions } from '@/data/homepageDemoData';
import { HeroCard } from '@/components/workspace/homepage/HeroCard';
import { KeyMomentsPanel } from '@/components/workspace/homepage/KeyMomentsPanel';
import { AppsIntegrations } from '@/components/workspace/homepage/AppsIntegrations';
import { ConnectFacebookModal } from '@/components/workspace/homepage/ConnectFacebookModal';
import { OnboardingQuizModal } from '@/components/workspace/homepage/OnboardingQuizModal';
import { WhileYouWereAwaySummary } from '@/components/workspace/homepage/WhileYouWereAwaySummary';
import { useToast } from '@/hooks/use-toast';

// ---- Detect which "persona" the current state matches ----
type HomepagePersona = 'new-user' | 'draft-ready' | 'returning-stale' | 'high-cpa' | 'power-user';

function detectPersona(state: ReturnType<typeof useUserState>['state']): HomepagePersona {
  if (!state.connected_facebook) return 'new-user';
  if (state.last_active) {
    const hoursAway = (Date.now() - new Date(state.last_active).getTime()) / 3600000;
    if (hoursAway >= 6) return 'returning-stale';
  }
  if (state.has_draft && !state.has_published_campaign) return 'draft-ready';
  if (state.has_published_campaign && state.has_draft) return 'power-user';
  return 'high-cpa';
}

const quickActions = [
  { id: 'create-campaign', label: 'Create Campaign', icon: Rocket, message: 'Plan a campaign' },
  { id: 'generate-video', label: 'Generate Video', icon: Video, message: 'Generate a video ad' },
  { id: 'generate-image', label: 'Generate Image', icon: ImageIcon, message: 'Generate image ads' },
  { id: 'upload-asset', label: 'Upload Asset', icon: Upload, message: 'Upload asset' },
  { id: 'run-audit', label: 'Run Audit', icon: Search, message: 'Run account audit' },
  { id: 'connect-integrations', label: 'Integrations', icon: Link2, message: '' },
];

const originalSuggestionChips = [
  { label: '🚀 Plan a campaign', message: 'Plan a campaign' },
  { label: '🧠 Advanced Strategy Planning', message: 'Help me plan an advanced Meta advertising strategy' },
  { label: '📦 Multi-variant product campaign', message: 'Plan a campaign for a product with multiple variants' },
  { label: '🎬 Generate a video ad', message: 'Generate a video ad' },
  { label: '🖼️ Generate image ads', message: 'Generate image ads' },
  { label: '📊 Check performance', message: 'Check performance' },
  { label: '🤖 Set up automation', message: 'Set up automation' },
];

interface WorkspaceHomeProps {
  onSendMessage: (message: string, context?: { path: string; filters?: Record<string, string[]> }) => void;
  userName?: string;
  credits?: number;
  onboardingComplete?: boolean;
  onboardingData?: OnboardingData | null;
  threads?: { id: string; title: string; status: string; updatedAt: Date }[];
  onSelectThread?: (threadId: string) => void;
}

export const WorkspaceHome = ({ onSendMessage, userName, onboardingData, threads = [], onSelectThread }: WorkspaceHomeProps) => {
  const [input, setInput] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const {
    state, connectFacebook, saveOnboardingAnswers, publishDraft,
    createDraft, pauseAlert, connectSlack,
  } = useUserState();

  const [showFBModal, setShowFBModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const persona = useMemo(() => detectPersona(state), [state]);
  const firstName = userName?.split(' ')[0] || '';
  const alerts = generateAlerts(demoKPIs);
  const primaryAction = state.connected_facebook ? computePrimaryAction(demoKPIs, state.has_draft) : null;

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const autoResize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.min(ref.current.scrollHeight, 150) + 'px';
    }
  };

  const handleFBConnected = () => {
    connectFacebook();
    toast({ title: '✅ Facebook connected', description: 'Your ad account is now linked. Dashboard populated with demo data.' });
  };

  const handleQuizComplete = (answers: OnboardingAnswers) => {
    saveOnboardingAnswers(answers);
    if (answers.generate_now) {
      createDraft();
      const draft = generateCampaignDraft(answers as Record<string, any>);
      toast({ title: '📋 Campaign draft created', description: `"${draft.name}" is ready to review and publish.` });
      onSendMessage(`Create a ${draft.style}-style ${draft.objective.toLowerCase()} campaign with $${draft.dailyBudget}/day budget targeting ${draft.audience} audiences on ${draft.platforms.join(', ')}`);
    } else {
      toast({ title: '✅ Setup complete', description: 'Your preferences are saved. Start creating anytime!' });
    }
  };

  const handleKeyMomentAction = useCallback((momentId: string, actionType: string, campaignName: string) => {
    if (actionType === 'pause') {
      pauseAlert(momentId);
      toast({ title: '⏸️ Paused (prototype)', description: `"${campaignName}" has been paused.` });
    } else if (actionType === 'play') {
      toast({ title: '▶️ Restarted (prototype)', description: `"${campaignName}" has been restarted.` });
      onSendMessage(`Restart campaign: ${campaignName}`);
    } else if (actionType === 'increase') {
      onSendMessage(`Increase budget for ${campaignName}`);
    } else if (actionType === 'decrease') {
      toast({ title: '📉 Budget decreased (prototype)', description: `Budget reduced for "${campaignName}".` });
    }
  }, [pauseAlert, toast, onSendMessage]);

  const handlePrimaryAction = useCallback((action: string) => {
    if (action === 'pause') {
      toast({ title: '⏸️ Low-performing adset paused', description: 'Spring Sale 2026 — Ad Set 3 has been paused.' });
    } else if (action === 'regenerate') {
      onSendMessage('Regenerate creatives for Spring Sale 2026');
    } else if (action === 'publish-draft') {
      publishDraft();
      toast({ title: '🚀 Campaign published!', description: 'Your draft campaign is now live on Facebook.' });
    } else if (action === 'increase-budget') {
      onSendMessage('Increase budget for my top performing ad in Spring Sale 2026');
    }
  }, [toast, onSendMessage, publishDraft]);

  const handleQuickAction = useCallback((actionId: string) => {
    if (actionId === 'connect-integrations') {
      setShowFBModal(true);
      return;
    }
    const action = quickActions.find(a => a.id === actionId);
    if (action?.message) onSendMessage(action.message);
  }, [onSendMessage]);

  const handleAppConnect = useCallback((appId: string) => {
    if (appId === 'facebook' || appId === 'trackers') {
      setShowFBModal(true);
    } else if (appId === 'slack') {
      connectSlack();
      toast({ title: '💬 Slack connected', description: 'Notifications will now be sent to your Slack workspace.' });
    }
  }, [connectSlack, toast]);

  const greeting = useMemo(() => {
    switch (persona) {
      case 'new-user':
        return { title: firstName ? `Welcome, ${firstName}` : 'Welcome to Vibelets', subtitle: "Your AI marketing OS. Let's get you set up in under 2 minutes." };
      case 'draft-ready':
        return { title: `${firstName || 'Hey'}, your campaign draft is ready`, subtitle: "Review and publish with one click — or fine-tune it first." };
      case 'returning-stale':
        return { title: `Welcome back, ${firstName || 'there'}`, subtitle: "Here's what changed while you were away." };
      case 'high-cpa':
        return { title: `${firstName ? `${firstName}, ` : ''}action needed`, subtitle: "Your AI has flagged items that need attention. Review and approve below." };
      case 'power-user':
        return { title: `${firstName ? `${firstName}'s` : 'Your'} command center`, subtitle: "Multi-campaign overview with scaling opportunities and creative refreshes." };
    }
  }, [persona, firstName]);

  const vibespaceProps = {
    input, setInput, inputRef: ref,
    onSubmit: handleSubmit, onKeyDown: handleKeyDown, onAutoResize: autoResize,
    onQuickAction: handleQuickAction, onSendMessage,
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-6 pb-8">
          {/* Greeting */}
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-foreground">{greeting.title}</h1>
            <p className="text-sm text-muted-foreground">{greeting.subtitle}</p>
          </div>

          {/* ========== NEW USER ========== */}
          {persona === 'new-user' && <NewUserLayout
            onConnectFB={() => setShowFBModal(true)}
            onStartTour={() => setShowQuizModal(true)}
            {...vibespaceProps}
          />}

          {/* ========== DRAFT READY ========== */}
          {persona === 'draft-ready' && <DraftReadyLayout
            state={state}
            primaryAction={primaryAction}
            onPrimaryAction={handlePrimaryAction}
            onKeyMomentAction={handleKeyMomentAction}
            {...vibespaceProps}
          />}

          {/* ========== RETURNING STALE ========== */}
          {persona === 'returning-stale' && <ReturningStaleLayout
            state={state}
            onKeyMomentAction={handleKeyMomentAction}
            {...vibespaceProps}
          />}

          {/* ========== HIGH CPA / ALERT FOCUSED ========== */}
          {persona === 'high-cpa' && <HighCPALayout
            onKeyMomentAction={handleKeyMomentAction}
            {...vibespaceProps}
          />}

          {/* ========== POWER USER ========== */}
          {persona === 'power-user' && <PowerUserLayout
            state={state}
            primaryAction={primaryAction}
            onPrimaryAction={handlePrimaryAction}
            onKeyMomentAction={handleKeyMomentAction}
            {...vibespaceProps}
          />}

          {/* Apps & Integrations — always */}
          <AppsIntegrations
            connectedFacebook={state.connected_facebook}
            slackConnected={state.apps.slack_connected}
            onConnect={handleAppConnect}
          />

          {/* More flows — always */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-medium text-foreground">More flows</h3>
            <div className="flex flex-wrap gap-2">
              {originalSuggestionChips.map((chip, i) => (
                <button
                  key={chip.message}
                  onClick={() => onSendMessage(chip.message)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 animate-fade-in",
                    "bg-muted/30 border border-border/40 text-muted-foreground",
                    "hover:bg-muted/60 hover:text-foreground hover:border-border hover:shadow-sm",
                    "active:scale-[0.97]"
                  )}
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer with Recent Decisions link */}
          <div className="flex items-center justify-center gap-4 pt-4 pb-2 border-t border-border/20">
            {state.connected_facebook && (
              <button
                onClick={() => onSendMessage('Show my recent decisions and actions history')}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ClipboardList className="w-3.5 h-3.5" /> Recent Decisions
              </button>
            )}
            <button className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="w-3.5 h-3.5" /> Help
            </button>
            <button className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <BookOpen className="w-3.5 h-3.5" /> Docs
            </button>
            <button className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-3.5 h-3.5" /> Contact
            </button>
          </div>
        </div>
      </div>

      <ConnectFacebookModal open={showFBModal} onClose={() => setShowFBModal(false)} onConnected={handleFBConnected} />
      <OnboardingQuizModal open={showQuizModal} onClose={() => setShowQuizModal(false)} onComplete={handleQuizComplete} />
    </>
  );
};

// ===========================================================================
// SHARED COMPONENTS
// ===========================================================================

interface VibespaceProps {
  input: string; setInput: (v: string) => void; inputRef: React.RefObject<HTMLTextAreaElement>;
  onSubmit: () => void; onKeyDown: (e: React.KeyboardEvent) => void; onAutoResize: () => void;
  onQuickAction: (id: string) => void; onSendMessage: (msg: string) => void;
  placeholder?: string;
}

const VibespaceWithActions = ({ input, setInput, inputRef, onSubmit, onKeyDown, onAutoResize, onQuickAction, onSendMessage, placeholder }: VibespaceProps) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Sparkles className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-medium text-foreground">Vibespace</h3>
    </div>
    <div className={cn(
      "flex items-end gap-2 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3",
      "shadow-lg shadow-primary/5 focus-within:border-primary/30 focus-within:shadow-xl focus-within:shadow-primary/10 transition-all"
    )}>
      <textarea
        ref={inputRef} value={input}
        onChange={e => { setInput(e.target.value); onAutoResize(); }}
        onKeyDown={onKeyDown}
        placeholder={placeholder || "Hi — I can help you launch a campaign in <1 minute. Try: 'Create campaign — budget $300 — sales'"}
        rows={1}
        className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/60 min-h-[36px] max-h-[150px] py-1.5"
      />
      <button
        onClick={onSubmit} disabled={!input.trim()}
        className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
          input.trim() ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted/50 text-muted-foreground/30"
        )}
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {quickActions.map((action, i) => (
        <button
          key={action.id} onClick={() => onQuickAction(action.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-xl border border-border/40 bg-card/60",
            "hover:bg-muted/40 hover:border-border hover:shadow-sm transition-all active:scale-[0.97] animate-fade-in"
          )}
          style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
        >
          <action.icon className="w-4.5 h-4.5 text-muted-foreground" />
          <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">{action.label}</span>
        </button>
      ))}
    </div>
  </div>
);

// ===========================================================================
// PERSONA LAYOUTS
// ===========================================================================

// ========== 1. NEW USER ==========
const NewUserLayout = ({ onConnectFB, onStartTour, ...vibespace }: { onConnectFB: () => void; onStartTour: () => void } & VibespaceProps) => (
  <>
    <HeroCard connectedFacebook={false} onConnectFacebook={onConnectFB} onStartTour={onStartTour} onPrimaryAction={() => {}} />
    <VibespaceWithActions {...vibespace} placeholder="Try: 'Create a sample campaign' or 'Show me what Vibelets can do'" />

    {/* Empty state: Key Moments */}
    <div className="rounded-2xl border border-dashed border-border/50 bg-muted/5 p-6 space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-muted-foreground/40" />
        <h3 className="text-sm font-medium text-muted-foreground/60">Key Moments</h3>
      </div>
      <div className="flex flex-col items-center py-4 space-y-2">
        <p className="text-sm text-muted-foreground/60 text-center max-w-xs">
          AI-powered recommendations will appear here once your ad account is connected
        </p>
        <button onClick={onConnectFB} className="text-xs text-primary hover:underline mt-1">
          Connect account to get started →
        </button>
      </div>
    </div>
  </>
);


// ========== 2. DRAFT READY ==========
const DraftReadyLayout = ({ state, primaryAction, onPrimaryAction, onKeyMomentAction, ...vibespace }: {
  state: ReturnType<typeof useUserState>['state'];
  primaryAction: ReturnType<typeof computePrimaryAction> | null;
  onPrimaryAction: (action: string) => void;
  onKeyMomentAction: (id: string, action: string, name: string) => void;
} & VibespaceProps) => {
  const draft = state.onboarding_answers
    ? generateCampaignDraft(state.onboarding_answers as Record<string, any>)
    : null;

  return (
    <>
      {/* Draft Summary Card */}
      <div className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/8 via-card to-card p-5 space-y-4 animate-fade-in">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
            <FileEdit className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Campaign draft ready</p>
            <h2 className="text-base font-semibold text-foreground">{draft?.name || 'Your Campaign Draft'}</h2>
            <p className="text-sm text-muted-foreground">Review and publish — or chat to make changes first.</p>
          </div>
        </div>
        {draft && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-1">
            <DraftDetail label="Objective" value={draft.objective} />
            <DraftDetail label="Daily Budget" value={`$${draft.dailyBudget}`} />
            <DraftDetail label="Platforms" value={draft.platforms.join(', ')} />
            <DraftDetail label="Creative Style" value={draft.style} />
          </div>
        )}
        <div className="flex items-center gap-3 pt-1">
          <button onClick={() => onPrimaryAction('publish-draft')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98] shadow-md">
            <Play className="w-4 h-4" /> Publish campaign
          </button>
          <button onClick={() => vibespace.onSendMessage(`Fine-tune my draft campaign: ${draft?.name || 'campaign'}`)} className="px-4 py-2.5 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all">
            Fine-tune in Vibespace
          </button>
        </div>
      </div>

      {/* Key Moments — side by side */}
      <KeyMomentsPanel moments={demoKeyMoments} potentialSavings="$102/day" onAction={onKeyMomentAction} onViewAll={() => vibespace.onSendMessage('Run account audit')} maxPerColumn={3} />

      <VibespaceWithActions {...vibespace} placeholder="Chat to adjust your draft — e.g. 'Change budget to $500'" />
    </>
  );
};

const DraftDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-0.5">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">{label}</p>
    <p className="text-xs font-medium text-foreground capitalize">{value}</p>
  </div>
);


// ========== 3. RETURNING STALE ==========
const ReturningStaleLayout = ({ state, onKeyMomentAction, ...vibespace }: {
  state: ReturnType<typeof useUserState>['state'];
  onKeyMomentAction: (id: string, action: string, name: string) => void;
} & VibespaceProps) => (
  <>
    {/* While You Were Away — bullet summary + alert chips */}
    <WhileYouWereAwaySummary
      lastActive={state.last_active}
      kpis={demoKPIs}
      onDismiss={() => {}}
      onViewDetails={() => vibespace.onSendMessage('Run account audit')}
    />

    {/* Key Moments — side by side */}
    <KeyMomentsPanel
      moments={demoKeyMoments}
      potentialSavings="$102/day"
      onAction={onKeyMomentAction}
      onViewAll={() => vibespace.onSendMessage('Run account audit')}
      maxPerColumn={3}
    />

    <VibespaceWithActions {...vibespace} placeholder="Ask: 'What happened while I was away?' or 'Run a full audit'" />
  </>
);


// ========== 4. HIGH CPA / ALERT FOCUSED ==========
const HighCPALayout = ({ onKeyMomentAction, ...vibespace }: {
  onKeyMomentAction: (id: string, action: string, name: string) => void;
} & VibespaceProps) => (
  <>
    {/* Urgency banner */}
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center gap-3 animate-fade-in">
      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
        <TrendingDown className="w-4.5 h-4.5 text-amber-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">Performance alert: CPA up 50%+</p>
        <p className="text-xs text-muted-foreground">Your AI has identified actions to reduce waste and improve ROAS. Review and approve below.</p>
      </div>
    </div>

    {/* Key Moments — side by side */}
    <KeyMomentsPanel
      moments={demoKeyMoments}
      potentialSavings="$80/day"
      onAction={onKeyMomentAction}
      onViewAll={() => vibespace.onSendMessage('Run account audit')}
      maxPerColumn={3}
    />

    <VibespaceWithActions {...vibespace} placeholder="Ask: 'Why is my CPA increasing?' or 'Which ad sets should I pause?'" />
  </>
);


// ========== 5. POWER USER ==========
const PowerUserLayout = ({ state, primaryAction, onPrimaryAction, onKeyMomentAction, ...vibespace }: {
  state: ReturnType<typeof useUserState>['state'];
  primaryAction: ReturnType<typeof computePrimaryAction> | null;
  onPrimaryAction: (action: string) => void;
  onKeyMomentAction: (id: string, action: string, name: string) => void;
} & VibespaceProps) => {
  const draft = state.onboarding_answers
    ? generateCampaignDraft(state.onboarding_answers as Record<string, any>)
    : null;

  const campaigns = [
    { name: 'Spring Sale 2026', status: 'live' as const, spend: '$1,420/day', roas: '3.2x', health: 72 },
    { name: 'Product Launch — Beta', status: 'draft' as const, spend: '$0', roas: '—', health: 100 },
    { name: 'Retargeting — Lookalike', status: 'live' as const, spend: '$380/day', roas: '4.1x', health: 89 },
  ];

  return (
    <>
      {/* Multi-campaign overview strip */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Active Campaigns</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
            {campaigns.filter(c => c.status === 'live').length} live
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {campaigns.map((camp, i) => (
            <button
              key={camp.name}
              onClick={() => vibespace.onSendMessage(`Show details for ${camp.name}`)}
              className="rounded-xl border border-border/40 bg-card/80 p-3.5 text-left hover:border-border hover:shadow-sm transition-all active:scale-[0.98] animate-fade-in"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-foreground truncate">{camp.name}</p>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                  camp.status === 'live' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-muted text-muted-foreground border border-border/30"
                )}>
                  {camp.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span>Spend: {camp.spend}</span>
                <span>ROAS: {camp.roas}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", camp.health >= 80 ? "bg-emerald-500" : camp.health >= 60 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${camp.health}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{camp.health}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Key Moments — side by side */}
      <KeyMomentsPanel
        moments={demoKeyMoments}
        potentialSavings="$102/day"
        onAction={onKeyMomentAction}
        onViewAll={() => vibespace.onSendMessage('Run account audit')}
        maxPerColumn={3}
      />

      {/* Draft ready banner */}
      {state.has_draft && draft && (
        <div className="rounded-xl border border-secondary/25 bg-secondary/5 px-4 py-3 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <FileEdit className="w-4 h-4 text-secondary" />
            <div>
              <p className="text-xs font-semibold text-foreground">{draft.name}</p>
              <p className="text-[11px] text-muted-foreground">Draft ready — {draft.platforms.join(', ')} · ${draft.dailyBudget}/day</p>
            </div>
          </div>
          <button onClick={() => onPrimaryAction('publish-draft')} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:opacity-90 transition-all active:scale-[0.97]">
            <Play className="w-3 h-3" /> Publish
          </button>
        </div>
      )}

      <VibespaceWithActions {...vibespace} placeholder="Ask: 'Scale my top ad by 20%' or 'Clone Spring Sale for TikTok'" />
    </>
  );
};
