import { useRef, useEffect, useCallback } from 'react';
import { Message } from '@/types/campaign';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AssistantChatMessage } from './AssistantChatMessage';
import { useAssistantChat, isGeneralQuery } from '@/hooks/useAssistantChat';
import vibeletsLogo from '@/assets/vibelets-logo-unified.png';

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
  
  const {
    messages: assistantMessages,
    isTyping: assistantIsTyping,
    sendMessage: sendAssistantMessage,
    isAssistantMode,
    setIsAssistantMode,
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

  const handleSendMessage = useCallback((message: string) => {
    // Intelligently route based on message content
    if (isGeneralQuery(message)) {
      setIsAssistantMode(true);
      sendAssistantMessage(message);
    } else {
      setIsAssistantMode(false);
      onSendMessage(message);
    }
  }, [onSendMessage, sendAssistantMessage, setIsAssistantMode]);

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

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="flex flex-col">
          {/* Campaign messages */}
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              onQuestionAnswer={(qId, aId) => {
                setIsAssistantMode(false);
                onQuestionAnswer(qId, aId);
              }}
              onCampaignConfigComplete={onCampaignConfigComplete}
              onFacebookConnect={onFacebookConnect}
              selectedAnswers={{}}
              isFacebookConnected={isFacebookConnected}
            />
          ))}
          {isTyping && !isAssistantMode && <TypingIndicator />}
          
          {/* Assistant messages (shown inline when active) */}
          {isAssistantMode && assistantMessages.slice(1).map((message) => (
            <AssistantChatMessage key={message.id} message={message} />
          ))}
          {isAssistantMode && assistantIsTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-background/30">
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={disabled || isTyping || assistantIsTyping} 
          placeholder="Paste product URL or ask a question..."
        />
      </div>
    </div>
  );
};
