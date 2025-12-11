import { useRef, useEffect } from 'react';
import { AssistantMessage } from '@/hooks/useAssistantChat';
import { AssistantChatMessage } from './AssistantChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ChatTabs, ChatMode } from './ChatTabs';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AssistantChatPanelProps {
  messages: AssistantMessage[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  activeTab: ChatMode;
  onTabChange: (tab: ChatMode) => void;
  hasNewAssistantMessage?: boolean;
}

export const AssistantChatPanel = ({
  messages,
  isTyping,
  onSendMessage,
  onClearChat,
  activeTab,
  onTabChange,
  hasNewAssistantMessage,
}: AssistantChatPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
        <div>
          <p className="text-xs text-muted-foreground">
            Ask questions about Vibelets
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onClearChat}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col">
          {messages.map((message) => (
            <AssistantChatMessage key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Input with integrated tabs */}
      <div className="flex-shrink-0 border-t border-border/50 bg-background/30">
        <div className="flex items-center justify-between px-4 pt-2">
          <ChatTabs 
            activeTab={activeTab} 
            onTabChange={onTabChange}
            hasNewAssistantMessage={hasNewAssistantMessage}
          />
        </div>
        <ChatInput
          onSend={onSendMessage}
          disabled={isTyping}
          placeholder="Ask about Vibelets..."
        />
      </div>
    </div>
  );
};
