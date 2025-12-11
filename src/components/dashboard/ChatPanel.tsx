import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { Message } from '@/types/campaign';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChatTabs, ChatMode } from './ChatTabs';
import { AssistantChatPanel } from './AssistantChatPanel';
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
  const [activeTab, setActiveTab] = useState<ChatMode>('campaign');
  const [hasNewAssistantMessage, setHasNewAssistantMessage] = useState(false);
  
  const {
    messages: assistantMessages,
    isTyping: assistantIsTyping,
    sendMessage: sendAssistantMessage,
    clearChat: clearAssistantChat,
  } = useAssistantChat();

  useEffect(() => {
    // Delay scroll to ensure DOM is updated
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

  // Clear notification when switching to assistant tab
  useEffect(() => {
    if (activeTab === 'assistant') {
      setHasNewAssistantMessage(false);
    }
  }, [activeTab]);

  const handleQuestionAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
    onQuestionAnswer(questionId, answerId);
  };

  const handleTabChange = (tab: ChatMode) => {
    setActiveTab(tab);
  };

  const handleSendMessage = useCallback((message: string) => {
    // Intelligent routing based on message content
    if (isGeneralQuery(message)) {
      // Route to assistant chat
      if (activeTab !== 'assistant') {
        setActiveTab('assistant');
        toast.info('Switched to Assistant', {
          description: 'I detected a general question. Answering in the Assistant tab.',
          duration: 3000,
        });
      }
      sendAssistantMessage(message);
    } else {
      // Route to campaign flow
      if (activeTab !== 'campaign') {
        setActiveTab('campaign');
        toast.info('Switched to Campaign', {
          description: 'Processing your campaign request.',
          duration: 3000,
        });
      }
      onSendMessage(message);
    }
  }, [activeTab, onSendMessage, sendAssistantMessage]);

  const handleAssistantMessage = useCallback((message: string) => {
    sendAssistantMessage(message);
    // If user sends from campaign tab context but it's a general query, show notification
    if (activeTab !== 'assistant') {
      setHasNewAssistantMessage(true);
    }
  }, [activeTab, sendAssistantMessage]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with subtle border */}
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

      {/* Tab Content */}
      {activeTab === 'campaign' ? (
        <>
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

          {/* Campaign Input with integrated tabs */}
          <div className="flex-shrink-0 border-t border-border/50 bg-background/30">
            <div className="flex items-center justify-between px-4 pt-2">
              <ChatTabs 
                activeTab={activeTab} 
                onTabChange={handleTabChange}
                hasNewAssistantMessage={hasNewAssistantMessage}
              />
            </div>
            <ChatInput 
              onSend={handleSendMessage} 
              disabled={disabled || isTyping} 
              placeholder="Paste product URL or ask a question..."
            />
          </div>
        </>
      ) : (
        <AssistantChatPanel
          messages={assistantMessages}
          isTyping={assistantIsTyping}
          onSendMessage={handleAssistantMessage}
          onClearChat={clearAssistantChat}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasNewAssistantMessage={hasNewAssistantMessage}
        />
      )}
    </div>
  );
};
