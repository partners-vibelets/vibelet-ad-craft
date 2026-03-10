import { useState, useRef, useCallback } from 'react';
import { ArrowUp, Sparkles, HelpCircle, BookOpen, Mail, Rocket, Video, ImageIcon, Upload, Search, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingData } from '@/components/workspace/OnboardingFlow';
import { useUserState, OnboardingAnswers } from '@/hooks/useUserState';
import { demoKPIs, demoAssets, generateAlerts, computePrimaryAction, generateCampaignDraft } from '@/data/homepageDemoData';
import { HeroCard } from '@/components/workspace/homepage/HeroCard';
import { AISignalsStrip } from '@/components/workspace/homepage/AISignalsStrip';
import { VibeboardSnapshot } from '@/components/workspace/homepage/VibeboardSnapshot';
import { AppsIntegrations } from '@/components/workspace/homepage/AppsIntegrations';
import { ConnectFacebookModal } from '@/components/workspace/homepage/ConnectFacebookModal';
import { OnboardingQuizModal } from '@/components/workspace/homepage/OnboardingQuizModal';
import { WhileYouWereAwaySummary } from '@/components/workspace/homepage/WhileYouWereAwaySummary';
import { useToast } from '@/hooks/use-toast';

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

  const firstName = userName?.split(' ')[0] || '';
  const alerts = generateAlerts(demoKPIs);
  const primaryAction = state.connected_facebook
    ? computePrimaryAction(demoKPIs, state.has_draft)
    : null;

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

  const handleMicroAction = useCallback((alertId: string, action: string, campaignName: string) => {
    if (action === 'pause') {
      pauseAlert(alertId);
      toast({ title: '⏸️ Adset paused (prototype)', description: `Low-performing adset in "${campaignName}" has been paused.` });
    } else if (action === 'regenerate') {
      const style = state.onboarding_answers?.style || 'UGC';
      onSendMessage(`Regenerate creatives for ${campaignName} — style: ${style}`);
    } else if (action === 'view') {
      onSendMessage(`Show me details for ${campaignName}`);
    } else if (action === 'adjust-budget') {
      onSendMessage(`Help me adjust the budget for ${campaignName}`);
    }
  }, [pauseAlert, toast, state.onboarding_answers, onSendMessage]);

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

  // --- LAYOUT: Different for new vs connected users ---
  const isConnected = state.connected_facebook;

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-6 pb-8">
          {/* Greeting */}
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-foreground">
              {firstName ? `Welcome back, ${firstName}` : 'Welcome to Vibelets'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isConnected
                ? "Here's what needs your attention today."
                : "Your AI marketing OS. Let's get you set up."}
            </p>
          </div>

          {/* ========== NEW USER FLOW ========== */}
          {!isConnected && (
            <>
              {/* Hero Card — connect CTA */}
              <HeroCard
                connectedFacebook={false}
                onConnectFacebook={() => setShowFBModal(true)}
                onStartTour={() => setShowQuizModal(true)}
                onPrimaryAction={handlePrimaryAction}
              />

              {/* Vibespace + Quick Actions combined */}
              <VibespaceWithActions
                input={input}
                setInput={setInput}
                inputRef={ref}
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                onAutoResize={autoResize}
                onQuickAction={handleQuickAction}
                onSendMessage={onSendMessage}
              />

              {/* AI Signals (sample) */}
              <AISignalsStrip
                alerts={alerts}
                isSample={true}
                pausedAlerts={state.paused_alerts}
                onMicroAction={handleMicroAction}
                onViewAllRecommendations={() => onSendMessage('Run account audit')}
              />

              {/* Vibeboard (sample) */}
              <VibeboardSnapshot
                kpis={demoKPIs}
                isSample={true}
                onViewFull={() => onSendMessage('Check performance')}
              />
            </>
          )}

          {/* ========== CONNECTED USER FLOW ========== */}
          {isConnected && (
            <>
              {/* While You Were Away — executive summary */}
              <WhileYouWereAwaySummary
                lastActive={state.last_active}
                kpis={demoKPIs}
                onDismiss={() => {}}
                onViewDetails={() => onSendMessage('Run account audit')}
              />

              {/* AI Signals — PRIMARY section: rich recommendation cards */}
              <AISignalsStrip
                alerts={alerts}
                isSample={false}
                pausedAlerts={state.paused_alerts}
                onMicroAction={handleMicroAction}
                onViewAllRecommendations={() => onSendMessage('Run account audit')}
              />

              {/* Vibeboard — live data */}
              <VibeboardSnapshot
                kpis={demoKPIs}
                isSample={false}
                onViewFull={() => onSendMessage('Check performance')}
              />

              {/* Vibespace + Quick Actions combined */}
              <VibespaceWithActions
                input={input}
                setInput={setInput}
                inputRef={ref}
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                onAutoResize={autoResize}
                onQuickAction={handleQuickAction}
                onSendMessage={onSendMessage}
              />
            </>
          )}

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

          {/* Footer */}
          <div className="flex items-center justify-center gap-4 pt-4 pb-2 border-t border-border/20">
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

      <ConnectFacebookModal
        open={showFBModal}
        onClose={() => setShowFBModal(false)}
        onConnected={handleFBConnected}
      />

      <OnboardingQuizModal
        open={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        onComplete={handleQuizComplete}
      />
    </>
  );
};

// ---- Combined Vibespace + Quick Actions ----
interface VibespaceWithActionsProps {
  input: string;
  setInput: (v: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onAutoResize: () => void;
  onQuickAction: (actionId: string) => void;
  onSendMessage: (msg: string) => void;
}

const VibespaceWithActions = ({
  input, setInput, inputRef, onSubmit, onKeyDown, onAutoResize, onQuickAction, onSendMessage,
}: VibespaceWithActionsProps) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Sparkles className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-medium text-foreground">Vibespace</h3>
    </div>

    {/* Chat input */}
    <div className={cn(
      "flex items-end gap-2 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3",
      "shadow-lg shadow-primary/5 focus-within:border-primary/30 focus-within:shadow-xl focus-within:shadow-primary/10 transition-all"
    )}>
      <textarea
        ref={inputRef}
        value={input}
        onChange={e => { setInput(e.target.value); onAutoResize(); }}
        onKeyDown={onKeyDown}
        placeholder="Hi — I can help you launch a campaign in <1 minute. Try: 'Create campaign — budget $300 — sales'"
        rows={1}
        className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/60 min-h-[36px] max-h-[150px] py-1.5"
      />
      <button
        onClick={onSubmit}
        disabled={!input.trim()}
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
          input.trim()
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "bg-muted/50 text-muted-foreground/30"
        )}
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>

    {/* Quick Actions inline — chat OR click */}
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {quickActions.map((action, i) => (
        <button
          key={action.id}
          onClick={() => onQuickAction(action.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-xl border border-border/40 bg-card/60",
            "hover:bg-muted/40 hover:border-border hover:shadow-sm transition-all active:scale-[0.97]",
            "animate-fade-in"
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
