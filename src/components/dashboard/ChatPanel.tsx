import { useRef, useEffect } from 'react';
import { Message } from '@/types/campaign';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import vibeletsLogo from '@/assets/vibelets-logo.png';

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatPanel = ({ messages, isTyping, onSendMessage, disabled }: ChatPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <img src={vibeletsLogo} alt="Vibelets" className="h-8 w-auto" />
        <div>
          <h2 className="font-semibold text-foreground">Campaign Builder</h2>
          <p className="text-xs text-muted-foreground">AI-powered ad creation</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={onSendMessage} disabled={disabled || isTyping} />
    </div>
  );
};
