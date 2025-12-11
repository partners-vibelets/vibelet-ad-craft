import { cn } from '@/lib/utils';
import { MessageSquare, Sparkles } from 'lucide-react';

export type ChatMode = 'campaign' | 'assistant';

interface ChatTabsProps {
  activeTab: ChatMode;
  onTabChange: (tab: ChatMode) => void;
  hasNewAssistantMessage?: boolean;
}

export const ChatTabs = ({ activeTab, onTabChange, hasNewAssistantMessage }: ChatTabsProps) => {
  return (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
      <button
        onClick={() => onTabChange('campaign')}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          activeTab === 'campaign'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Campaign</span>
      </button>
      <button
        onClick={() => onTabChange('assistant')}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 relative",
          activeTab === 'assistant'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>Assistant</span>
        {hasNewAssistantMessage && activeTab !== 'assistant' && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-secondary rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
};
