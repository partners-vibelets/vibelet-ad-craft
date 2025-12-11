import { useRef, useEffect } from 'react';
import { AssistantMessage } from '@/hooks/useAssistantChat';
import { AssistantChatMessage } from './AssistantChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface AssistantDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: AssistantMessage[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
}

export const AssistantDrawer = ({
  open,
  onOpenChange,
  messages,
  isTyping,
  onSendMessage,
  onClearChat,
}: AssistantDrawerProps) => {
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-[380px] sm:w-[420px] p-0 flex flex-col gap-0 border-l border-border/50"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-base font-semibold">Vibelets Assistant</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Ask anything about the platform</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onClearChat}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col">
            {messages.map((message) => (
              <AssistantChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-border/50 bg-background/50">
          <ChatInput
            onSend={onSendMessage}
            disabled={isTyping}
            placeholder="Ask about Vibelets..."
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
