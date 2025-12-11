import { useRef, useEffect, useState, useCallback } from 'react';
import { Message } from '@/types/campaign';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AssistantDrawer } from './AssistantDrawer';
import { AssistantFloatingButton } from './AssistantFloatingButton';
import { useAssistantChat, isGeneralQuery } from '@/hooks/useAssistantChat';
import vibeletsLogo from '@/assets/vibelets-logo-unified.png';
import { toast } from 'sonner';

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
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [hasAssistantNotification, setHasAssistantNotification] = useState(false);
  
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
  }, [messages, isTyping]);

  // Clear notification when drawer opens
  useEffect(() => {
    if (isAssistantOpen) {
      setHasAssistantNotification(false);
    }
  }, [isAssistantOpen]);

  const handleQuestionAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
    onQuestionAnswer(questionId, answerId);
  };

  const handleSendMessage = useCallback((message: string) => {
    // Intelligent routing based on message content
    if (isGeneralQuery(message)) {
      // Route to assistant drawer
      setIsAssistantOpen(true);
      sendAssistantMessage(message);
      toast.info('Answering in Assistant', {
        description: 'I detected a general question.',
        duration: 2500,
      });
    } else {
      // Route to campaign flow
      onSendMessage(message);
    }
  }, [onSendMessage, sendAssistantMessage]);

  const handleAssistantButtonClick = () => {
    setIsAssistantOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0 bg-background/30">
        <div className="flex items-center gap-3">
          <img src={vibeletsLogo} alt="Vibelets" className="h-7 w-auto flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-foreground">Campaign Builder</h2>
            <p className="text-xs text-muted-foreground">AI-powered ad creation</p>
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
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border/50 bg-background/30">
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={disabled || isTyping} 
          placeholder="Paste product URL or ask a question..."
        />
      </div>

      {/* Floating Assistant Button */}
      <div className="absolute bottom-28 right-3">
        <AssistantFloatingButton 
          onClick={handleAssistantButtonClick}
          hasNotification={hasAssistantNotification}
        />
      </div>

      {/* Assistant Drawer */}
      <AssistantDrawer
        open={isAssistantOpen}
        onOpenChange={setIsAssistantOpen}
        messages={assistantMessages}
        isTyping={assistantIsTyping}
        onSendMessage={sendAssistantMessage}
        onClearChat={clearAssistantChat}
      />
    </div>
  );
};
