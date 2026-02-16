import { useState, useRef } from 'react';
import { ArrowUp, Target, Palette, BarChart3, Shield, Zap, Bot, ChevronLeft, Image, Video, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type PathId = 'campaign' | 'creative' | 'audit' | 'performance' | 'recommendations' | 'automation' | null;

interface PathOption {
  id: PathId;
  emoji: string;
  label: string;
  desc: string;
  icon: typeof Target;
  filters?: FilterConfig[];
  placeholder: string;
}

interface FilterConfig {
  id: string;
  label: string;
  options: { id: string; label: string; emoji?: string }[];
  multi?: boolean;
}

const paths: PathOption[] = [
  {
    id: 'campaign', emoji: '🚀', label: 'Plan a Campaign', desc: 'AI-guided campaign creation',
    icon: Target, placeholder: 'Paste your product URL or describe what you want to promote...',
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
    id: 'creative', emoji: '🎨', label: 'Generate Creatives', desc: 'AI images, videos & ad copy',
    icon: Palette, placeholder: 'Paste your product URL or describe what you want to create...',
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
    id: 'audit', emoji: '🔍', label: 'Audit My Account', desc: '30-day deep analysis',
    icon: Shield, placeholder: 'Any specific areas to focus on? Or I\'ll run a full audit...',
  },
  {
    id: 'performance', emoji: '📊', label: 'Check Performance', desc: 'Real-time metrics & insights',
    icon: BarChart3, placeholder: 'Which campaign or metric are you curious about?',
  },
  {
    id: 'recommendations', emoji: '⚡', label: 'AI Recommendations', desc: 'Smart optimization actions',
    icon: Zap, placeholder: 'Any specific campaigns to optimize?',
  },
  {
    id: 'automation', emoji: '🤖', label: 'Automation Rules', desc: 'Auto-pause, scale & optimize',
    icon: Bot, placeholder: 'What should I automate? e.g. "pause ads with CPA > $20"',
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

interface WorkspaceHomeProps {
  onSendMessage: (message: string, context?: { path: string; filters?: Record<string, string[]> }) => void;
  userName?: string;
  credits?: number;
}

export const WorkspaceHome = ({ onSendMessage, userName, credits }: WorkspaceHomeProps) => {
  const [input, setInput] = useState('');
  const [selectedPath, setSelectedPath] = useState<PathId>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const ref = useRef<HTMLTextAreaElement>(null);

  const activePath = paths.find(p => p.id === selectedPath);

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
        : [optionId]; // single select
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
          <h1 className="text-2xl font-semibold text-foreground">
            {userName ? `Welcome back, ${userName.split(' ')[0]}` : 'Welcome to Vibelets'}
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your AI marketing operating system. Tell me what you need, or pick a path below.
          </p>
        </div>

        {/* Chat input + path area */}
        <div className="space-y-3">
          {/* Path selection OR filter chips */}
          {!selectedPath ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {paths.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePathSelect(p.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-medium transition-all",
                    "bg-muted/40 border border-border/50 text-muted-foreground",
                    "hover:bg-muted hover:text-foreground hover:border-border"
                  )}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
              <button
                onClick={() => onSendMessage('Run full demo', { path: 'demo' })}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-medium transition-all",
                  "bg-primary/10 border border-primary/20 text-primary",
                  "hover:bg-primary/20 hover:border-primary/30"
                )}
              >
                🎬 Run full demo
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Selected path header + back */}
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

              {/* Context filters */}
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
