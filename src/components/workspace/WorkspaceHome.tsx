import { useState, useRef } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingData } from '@/components/workspace/OnboardingFlow';

function getPersonalizedGreeting(onboardingData?: OnboardingData | null, userName?: string): { title: string; subtitle: string } {
  const firstName = userName?.split(' ')[0] || '';
  const goals = onboardingData?.goals || [];

  if (goals.includes('launch')) {
    return {
      title: firstName ? `Let's get started, ${firstName}` : "Let's get started",
      subtitle: "Tell me what you need — I'll handle the rest.",
    };
  }
  if (goals.includes('scale')) {
    return {
      title: firstName ? `Ready to scale, ${firstName}?` : 'Ready to scale?',
      subtitle: "Let's find your next growth lever.",
    };
  }
  if (goals.includes('creative')) {
    return {
      title: firstName ? `Let's create something great, ${firstName}` : "Let's create something great",
      subtitle: 'AI-powered images, videos, and copy — tailored to your brand.',
    };
  }
  if (goals.includes('optimize')) {
    return {
      title: firstName ? `Let's optimize, ${firstName}` : "Let's optimize your spend",
      subtitle: "I'll find what's underperforming and give you one-click fixes.",
    };
  }

  return {
    title: firstName ? `Welcome back, ${firstName}` : 'Welcome to Vibelets',
    subtitle: 'Your AI marketing OS. Tell me what you need, or pick a suggestion below.',
  };
}

const suggestionChips = [
  { label: '🚀 Plan a campaign', message: 'Plan a campaign' },
  { label: '📦 Multi-variant product campaign', message: 'Plan a campaign for a product with multiple variants' },
  { label: '🧠 Full marketing strategy', message: 'Build a full marketing strategy playbook' },
  { label: '🎬 Generate a video ad', message: 'Generate a video ad' },
  { label: '🖼️ Generate image ads', message: 'Generate image ads' },
  { label: '🔍 Run account audit', message: 'Run account audit' },
  { label: '📊 Check performance', message: 'Check performance' },
  { label: '📱 Connect Facebook', message: 'Connect Facebook' },
  { label: '🤖 Set up automation', message: 'Set up automation' },
];

interface WorkspaceHomeProps {
  onSendMessage: (message: string, context?: { path: string; filters?: Record<string, string[]> }) => void;
  userName?: string;
  credits?: number;
  onboardingComplete?: boolean;
  onboardingData?: OnboardingData | null;
}

export const WorkspaceHome = ({ onSendMessage, userName, onboardingData }: WorkspaceHomeProps) => {
  const [input, setInput] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const greeting = getPersonalizedGreeting(onboardingData, userName);

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handleChipClick = (message: string) => {
    onSendMessage(message);
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

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestionChips.map((chip, i) => (
            <button
              key={chip.message}
              onClick={() => handleChipClick(chip.message)}
              style={{ animationDelay: `${i * 50}ms` }}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 animate-fade-in",
                "bg-muted/30 border border-border/40 text-muted-foreground",
                "hover:bg-muted/60 hover:text-foreground hover:border-border hover:shadow-sm",
                "active:scale-[0.97]"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
