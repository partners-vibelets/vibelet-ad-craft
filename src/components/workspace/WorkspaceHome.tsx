import { useState, useRef } from 'react';
import { Sparkles, ArrowUp, Zap, Target, Palette, BarChart3, Shield, Bot, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import vibeLogo from '@/assets/vibelets-logo-unified.png';

const capabilities = [
  { icon: Target, label: 'Campaign Planning', desc: 'Plan & launch ad campaigns with AI' },
  { icon: Palette, label: 'Creative Generation', desc: 'AI images, videos & ad copy' },
  { icon: BarChart3, label: 'Performance Analysis', desc: 'Real-time metrics & insights' },
  { icon: Shield, label: 'Account Auditing', desc: '30-day deep account audit' },
  { icon: Zap, label: 'AI Recommendations', desc: 'Smart budget & targeting actions' },
  { icon: Bot, label: 'Automation Rules', desc: 'Auto-pause, scale & optimize' },
];

const quickStarts = [
  { emoji: '🎬', label: 'Run full demo', message: 'Run full demo' },
  { emoji: '🚀', label: 'Plan a campaign', message: 'Plan a new campaign' },
  { emoji: '🎨', label: 'Create ad creatives', message: 'Create ad creatives' },
  { emoji: '📱', label: 'Connect Facebook', message: 'Connect my Facebook account' },
  { emoji: '🔍', label: 'Audit my account', message: 'Audit my Facebook ad account' },
  { emoji: '⚡', label: 'Set up automation', message: 'Set up automation rules' },
];

interface WorkspaceHomeProps {
  onSendMessage: (message: string) => void;
  userName?: string;
  credits?: number;
}

export const WorkspaceHome = ({ onSendMessage, userName, credits }: WorkspaceHomeProps) => {
  const [input, setInput] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
      <div className="max-w-2xl w-full space-y-10 animate-fade-in">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {userName ? `Welcome back, ${userName.split(' ')[0]}` : 'Welcome to Vibelets'}
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your AI marketing operating system. Plan campaigns, generate creatives, analyze performance, and automate — all through conversation.
          </p>
        </div>

        {/* Chat input — hero style */}
        <div className="relative">
          <div className={cn(
            "flex items-end gap-2 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3",
            "shadow-lg shadow-primary/5 focus-within:border-primary/30 focus-within:shadow-xl focus-within:shadow-primary/10 transition-all"
          )}>
            <textarea
              ref={ref}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what you'd like to work on..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/60 min-h-[36px] max-h-[150px] py-1.5"
            />
            <button
              onClick={handleSubmit}
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
        </div>

        {/* Quick starts */}
        <div className="flex flex-wrap gap-2 justify-center">
          {quickStarts.map(qs => (
            <button
              key={qs.label}
              onClick={() => onSendMessage(qs.message)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-muted-foreground bg-muted/40 border border-border/50 hover:bg-muted hover:text-foreground hover:border-border transition-all"
            >
              {qs.emoji} {qs.label}
            </button>
          ))}
        </div>

        {/* Capabilities grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {capabilities.map(cap => (
            <div
              key={cap.label}
              className="p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border/60 transition-all cursor-default group"
            >
              <cap.icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors mb-2" />
              <div className="text-xs font-medium text-foreground">{cap.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{cap.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
