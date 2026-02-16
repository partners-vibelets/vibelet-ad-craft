import { useState, useRef } from 'react';
import { ArrowUp, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingData } from '@/components/workspace/OnboardingFlow';

type PathId = 'campaign' | 'creative' | 'audit' | 'performance' | 'recommendations' | 'automation' | null;

interface PathOption {
  id: PathId;
  emoji: string;
  label: string;
  desc: string;
  filters?: FilterConfig[];
  placeholder: string;
  goalTags: string[]; // which onboarding goals map to this path
}

interface FilterConfig {
  id: string;
  label: string;
  options: { id: string; label: string; emoji?: string }[];
  multi?: boolean;
}

const allPaths: PathOption[] = [
  {
    id: 'campaign', emoji: '🚀', label: 'Launch a Campaign', desc: 'Plan, create & publish ads',
    placeholder: 'Paste your product URL or describe what you want to promote...',
    goalTags: ['launch', 'scale'],
    filters: [
      { id: 'objective', label: 'Goal', options: [
        { id: 'sales', label: 'Sales', emoji: '💰' },
        { id: 'awareness', label: 'Awareness', emoji: '📣' },
        { id: 'traffic', label: 'Traffic', emoji: '🔗' },
        { id: 'leads', label: 'Leads', emoji: '📋' },
      ]},
      { id: 'platform', label: 'Platform', options: [
        { id: 'facebook', label: 'Facebook', emoji: '📘' },
        { id: 'instagram', label: 'Instagram', emoji: '📸' },
        { id: 'both', label: 'Both', emoji: '✨' },
      ]},
    ],
  },
  {
    id: 'creative', emoji: '🎬', label: 'Create Better Ads', desc: 'AI images, videos & copy',
    placeholder: 'Paste your product URL or describe what you want to create...',
    goalTags: ['creative'],
    filters: [
      { id: 'type', label: 'Format', options: [
        { id: 'image', label: 'Images', emoji: '🖼️' },
        { id: 'video', label: 'Video', emoji: '🎬' },
        { id: 'both', label: 'Both', emoji: '✨' },
      ]},
      { id: 'style', label: 'Style', options: [
        { id: 'bold', label: 'Bold & Trendy', emoji: '😎' },
        { id: 'minimal', label: 'Clean & Minimal', emoji: '🌿' },
        { id: 'fun', label: 'Fun & Vibrant', emoji: '🎉' },
        { id: 'premium', label: 'Premium', emoji: '💎' },
      ]},
    ],
  },
  {
    id: 'audit', emoji: '🔍', label: 'Audit My Account', desc: '30-day deep analysis & report',
    placeholder: "Any specific areas to focus on? Or I'll run a full audit...",
    goalTags: ['scale', 'optimize'],
  },
  {
    id: 'recommendations', emoji: '⚡', label: 'Reduce Wasted Spend', desc: 'AI-powered optimization',
    placeholder: 'Any specific campaigns to optimize?',
    goalTags: ['optimize', 'scale'],
  },
  {
    id: 'performance', emoji: '📊', label: 'Check Performance', desc: 'Real-time metrics & insights',
    placeholder: 'Which campaign or metric are you curious about?',
    goalTags: ['scale', 'optimize'],
  },
  {
    id: 'automation', emoji: '🤖', label: 'Set Up Automation', desc: 'Auto-pause, scale & optimize',
    placeholder: 'What should I automate? e.g. "pause ads with CPA > $20"',
    goalTags: ['optimize', 'scale'],
    filters: [
      { id: 'trigger', label: 'Trigger type', options: [
        { id: 'cpa', label: 'High CPA', emoji: '📈' },
        { id: 'roas', label: 'Low ROAS', emoji: '📉' },
        { id: 'budget', label: 'Budget cap', emoji: '💰' },
        { id: 'fatigue', label: 'Creative fatigue', emoji: '😴' },
      ]},
    ],
  },
];

// Maps onboarding goals to personalized primary paths (shown as cards)
function getPersonalizedPaths(onboardingData?: OnboardingData | null): { primary: PathOption[]; secondary: PathOption[] } {
  const goals = onboardingData?.goals || [];
  
  if (goals.length === 0) {
    // No onboarding data — show top 4 as primary, rest as secondary chips
    return { primary: allPaths.slice(0, 4), secondary: allPaths.slice(4) };
  }

  // Score paths by how many of user's goals match
  const scored = allPaths.map(p => ({
    path: p,
    score: p.goalTags.filter(tag => goals.includes(tag)).length,
  }));
  scored.sort((a, b) => b.score - a.score);

  const primary = scored.filter(s => s.score > 0).map(s => s.path).slice(0, 4);
  const secondary = scored.filter(s => s.score === 0).map(s => s.path);

  // Ensure we have at least 2 primary
  if (primary.length < 2) {
    const remaining = allPaths.filter(p => !primary.includes(p));
    primary.push(...remaining.slice(0, 2 - primary.length));
  }

  return { primary, secondary };
}

function getPersonalizedGreeting(onboardingData?: OnboardingData | null, userName?: string): { title: string; subtitle: string } {
  const firstName = userName?.split(' ')[0] || '';
  const experience = onboardingData?.ad_experience;
  const businessType = onboardingData?.business_type;
  const goals = onboardingData?.goals || [];

  const businessLabel: Record<string, string> = {
    ecommerce: 'your store',
    saas: 'your product',
    services: 'your business',
    creator: 'your brand',
  };

  const biz = businessType ? businessLabel[businessType] || 'your business' : '';

  if (goals.includes('launch') && (experience === 'beginner' || experience === 'some')) {
    return {
      title: firstName ? `Let's get ${biz} live, ${firstName}` : `Let's get ${biz} live`,
      subtitle: "I'll handle the complexity — just tell me about your product and I'll create everything.",
    };
  }
  if (goals.includes('scale')) {
    return {
      title: firstName ? `Ready to scale, ${firstName}?` : 'Ready to scale?',
      subtitle: `I've analyzed what typically works for ${biz || 'businesses like yours'}. Let's find your next growth lever.`,
    };
  }
  if (goals.includes('creative')) {
    return {
      title: firstName ? `Let's create something great, ${firstName}` : "Let's create something great",
      subtitle: 'AI-powered images, videos, and copy — tailored to your brand and audience.',
    };
  }
  if (goals.includes('optimize')) {
    return {
      title: firstName ? `Let's cut the waste, ${firstName}` : "Let's optimize your spend",
      subtitle: "I'll audit your campaigns, find what's underperforming, and give you one-click fixes.",
    };
  }

  return {
    title: firstName ? `Welcome back, ${firstName}` : 'Welcome to Vibelets',
    subtitle: 'Your AI marketing operating system. Tell me what you need, or pick a path below.',
  };
}

interface WorkspaceHomeProps {
  onSendMessage: (message: string, context?: { path: string; filters?: Record<string, string[]> }) => void;
  userName?: string;
  credits?: number;
  onboardingComplete?: boolean;
  onboardingData?: OnboardingData | null;
}

export const WorkspaceHome = ({ onSendMessage, userName, credits, onboardingData }: WorkspaceHomeProps) => {
  const [input, setInput] = useState('');
  const [selectedPath, setSelectedPath] = useState<PathId>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const ref = useRef<HTMLTextAreaElement>(null);

  const { primary, secondary } = getPersonalizedPaths(onboardingData);
  const greeting = getPersonalizedGreeting(onboardingData, userName);
  const activePath = allPaths.find(p => p.id === selectedPath);

  const handleSubmit = () => {
    if (!input.trim() && !selectedPath) return;
    const message = input.trim() || (activePath ? activePath.label : '');
    onSendMessage(message, selectedPath ? { path: selectedPath, filters: selectedFilters } : undefined);
    setInput('');
    setSelectedPath(null);
    setSelectedFilters({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handlePathSelect = (pathId: PathId) => {
    setSelectedPath(pathId);
    setSelectedFilters({});
    setTimeout(() => ref.current?.focus(), 100);
  };

  const handleFilterToggle = (filterId: string, optionId: string) => {
    setSelectedFilters(prev => {
      const current = prev[filterId] || [];
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [optionId];
      return { ...prev, [filterId]: updated };
    });
  };

  const handleBack = () => {
    setSelectedPath(null);
    setSelectedFilters({});
  };

  const autoResize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.min(ref.current.scrollHeight, 150) + 'px';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{greeting.title}</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">{greeting.subtitle}</p>
        </div>

        {/* Path selection area */}
        <div className="space-y-3">
          {!selectedPath ? (
            <div className="space-y-3">
              {/* Primary paths as cards */}
              <div className="grid grid-cols-2 gap-3">
                {primary.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePathSelect(p.id)}
                    className={cn(
                      "flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all duration-200",
                      "border-border/50 bg-card/50 hover:border-border hover:bg-muted/30 hover:shadow-sm"
                    )}
                  >
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-sm font-medium text-foreground">{p.label}</span>
                    <span className="text-[11px] text-muted-foreground leading-snug">{p.desc}</span>
                  </button>
                ))}
              </div>

              {/* Secondary paths as small chips + demo */}
              {(secondary.length > 0) && (
                <div className="flex flex-wrap gap-2 justify-center pt-1">
                  {secondary.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handlePathSelect(p.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all",
                        "bg-muted/30 border border-border/40 text-muted-foreground",
                        "hover:bg-muted/60 hover:text-foreground hover:border-border"
                      )}
                    >
                      {p.emoji} {p.label}
                    </button>
                  ))}
                  <button
                    onClick={() => onSendMessage('Run full demo', { path: 'demo' })}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all",
                      "bg-primary/10 border border-primary/20 text-primary",
                      "hover:bg-primary/20 hover:border-primary/30"
                    )}
                  >
                    🎬 Run full demo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <button
                  onClick={handleBack}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-foreground">
                  {activePath?.emoji} {activePath?.label}
                </span>
                <span className="text-[11px] text-muted-foreground">— {activePath?.desc}</span>
              </div>

              {activePath?.filters && activePath.filters.map(filter => (
                <div key={filter.id} className="flex items-center gap-2 justify-center flex-wrap">
                  <span className="text-[11px] text-muted-foreground/70 font-medium min-w-[50px] text-right">{filter.label}:</span>
                  {filter.options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleFilterToggle(filter.id, opt.id)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border",
                        selectedFilters[filter.id]?.includes(opt.id)
                          ? "bg-primary/15 border-primary/30 text-primary"
                          : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Chat input */}
          <div className={cn(
            "flex items-end gap-2 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3",
            "shadow-lg shadow-primary/5 focus-within:border-primary/30 focus-within:shadow-xl focus-within:shadow-primary/10 transition-all"
          )}>
            <textarea
              ref={ref}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              placeholder={activePath?.placeholder || "Tell me what you'd like to work on..."}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/60 min-h-[36px] max-h-[150px] py-1.5"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() && !selectedPath}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                (input.trim() || selectedPath)
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted/50 text-muted-foreground/30"
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
