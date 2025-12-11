import { useRef, useEffect, useCallback, useState } from 'react';
import { Message } from '@/types/campaign';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AssistantChatMessage } from './AssistantChatMessage';
import { useAssistantChat, isGeneralQuery } from '@/hooks/useAssistantChat';
import vibeletsLogo from '@/assets/vibelets-logo-unified.png';
import { MessageCircle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onQuestionAnswer: (questionId: string, answerId: string) => void;
  onCampaignConfigComplete?: (config: Record<string, string>) => void;
  onFacebookConnect?: () => void;
  isFacebookConnected?: boolean;
  disabled?: boolean;
}

export const ChatPanel = ({ 
  messages, 
  isTyping, 
  onSendMessage, 
  onQuestionAnswer,
  onCampaignConfigComplete,
  onFacebookConnect,
  isFacebookConnected,
  disabled 
}: ChatPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const assistantScrollRef = useRef<HTMLDivElement>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  const {
    messages: assistantMessages,
    isTyping: assistantIsTyping,
    sendMessage: sendAssistantMessage,
    clearChat: clearAssistantChat,
  } = useAssistantChat();

  // Scroll campaign chat
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  // Scroll assistant chat
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (assistantScrollRef.current && isAssistantOpen) {
        assistantScrollRef.current.scrollTo({
          top: assistantScrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [assistantMessages, assistantIsTyping, isAssistantOpen]);

  const handleSendMessage = useCallback((message: string) => {
    // Intelligently route based on message content
    if (isGeneralQuery(message)) {
      setIsAssistantOpen(true);
      sendAssistantMessage(message);
    } else {
      setIsAssistantOpen(false);
      onSendMessage(message);
    }
  }, [onSendMessage, sendAssistantMessage]);

  const handleAssistantSend = useCallback((message: string) => {
    sendAssistantMessage(message);
  }, [sendAssistantMessage]);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0 bg-background/30">
        <div className="flex items-center gap-3">
          <img src={vibeletsLogo} alt="Vibelets" className="h-7 w-auto flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-foreground whitespace-nowrap">
              Campaign Builder
            </h2>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              AI-powered ad creation
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Campaign Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="flex flex-col">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              onQuestionAnswer={onQuestionAnswer}
              onCampaignConfigComplete={onCampaignConfigComplete}
              onFacebookConnect={onFacebookConnect}
              selectedAnswers={{}}
              isFacebookConnected={isFacebookConnected}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Assistant Chat Overlay */}
      {isAssistantOpen && (
        <div className="absolute inset-0 top-[73px] bg-background/95 backdrop-blur-sm z-10 flex flex-col">
          {/* Assistant Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/50 bg-secondary/20">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Help & Support</span>
            </div>
            <div className="flex items-center gap-1">
              {assistantMessages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={clearAssistantChat}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsAssistantOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Assistant Messages */}
          <div 
            ref={assistantScrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-4"
          >
            {assistantMessages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Ask me anything about Vibelets!</p>
                <p className="text-xs mt-1">e.g., "What is Vibelets?", "How does it work?"</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {assistantMessages.map((message) => (
                  <AssistantChatMessage key={message.id} message={message} />
                ))}
                {assistantIsTyping && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* Assistant Input */}
          <div className="bg-background/30 p-3 border-t border-border/30">
            <ChatInput 
              onSend={handleAssistantSend} 
              disabled={assistantIsTyping}
              placeholder="Ask a question..."
            />
          </div>
        </div>
      )}

      {/* Input Area with Chat Icon */}
      <div className="flex-shrink-0 bg-background/30 relative">
        {/* Chat Icon Button */}
        <div className="absolute -top-12 right-4 z-20">
          <Button
            variant={isAssistantOpen ? "default" : "outline"}
            size="icon"
            className={`h-9 w-9 rounded-full shadow-lg transition-all ${
              isAssistantOpen 
                ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' 
                : 'bg-background hover:bg-secondary/20 border-secondary/50'
            }`}
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          >
            <MessageCircle className={`h-4 w-4 ${isAssistantOpen ? '' : 'text-secondary'}`} />
          </Button>
        </div>
        
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={disabled || isTyping || assistantIsTyping} 
          placeholder="Paste product URL or ask a question..."
        />
      </div>
    </div>
  );
};
