import { useRef, useEffect, useState, useCallback } from 'react';
import { Message } from '@/types/campaign';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AssistantChatMessage } from './AssistantChatMessage';
import { useAssistantChat } from '@/hooks/useAssistantChat';
import vibeletsLogo from '@/assets/vibelets-logo-unified.png';
import { MessageCircle, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'campaign' | 'assistant'>('campaign');
  
  const {
    messages: assistantMessages,
    isTyping: assistantIsTyping,
    sendMessage: sendAssistantMessage,
    clearChat: clearAssistantChat,
  } = useAssistantChat();

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
  }, [messages, isTyping, assistantMessages, assistantIsTyping]);

  const handleQuestionAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
    onQuestionAnswer(questionId, answerId);
  };

  const handleSendMessage = useCallback((message: string) => {
    if (mode === 'assistant') {
      sendAssistantMessage(message);
    } else {
      onSendMessage(message);
    }
  }, [mode, onSendMessage, sendAssistantMessage]);

  const toggleMode = () => {
    setMode(prev => prev === 'campaign' ? 'assistant' : 'campaign');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0 bg-background/30">
        <div className="flex items-center gap-3">
          <img src={vibeletsLogo} alt="Vibelets" className="h-7 w-auto flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-foreground">
              {mode === 'campaign' ? 'Campaign Builder' : 'Assistant'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === 'campaign' ? 'AI-powered ad creation' : 'Ask me anything'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Chat Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMode}
            className={cn(
              "h-8 px-3 gap-1.5 text-xs font-medium transition-all",
              mode === 'assistant' 
                ? "bg-secondary/20 text-secondary hover:bg-secondary/30" 
                : "hover:bg-secondary/10 text-muted-foreground hover:text-secondary"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
          {mode === 'assistant' && assistantMessages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearAssistantChat}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="flex flex-col">
          {mode === 'campaign' ? (
            <>
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onQuestionAnswer={handleQuestionAnswer}
                  onCampaignConfigComplete={onCampaignConfigComplete}
                  onFacebookConnect={onFacebookConnect}
                  selectedAnswers={selectedAnswers}
                  isFacebookConnected={isFacebookConnected}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          ) : (
            <>
              {assistantMessages.map((message) => (
                <AssistantChatMessage key={message.id} message={message} />
              ))}
              {assistantIsTyping && <TypingIndicator />}
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border/50 bg-background/30">
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={mode === 'campaign' ? (disabled || isTyping) : assistantIsTyping} 
          placeholder={mode === 'campaign' ? "Paste product URL or ask a question..." : "Ask me anything about Vibelets..."}
        />
      </div>
    </div>
  );
};