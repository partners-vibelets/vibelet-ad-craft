import { useRef, useEffect, useState } from 'react';
import { Message } from '@/types/campaign';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import vibeletsLogo from '@/assets/vibelets-logo.png';

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onQuestionAnswer: (questionId: string, answerId: string) => void;
  disabled?: boolean;
}

export const ChatPanel = ({ 
  messages, 
  isTyping, 
  onSendMessage, 
  onQuestionAnswer,
  disabled 
}: ChatPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleQuestionAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
    onQuestionAnswer(questionId, answerId);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with subtle border */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 flex-shrink-0 bg-background/30">
        <img src={vibeletsLogo} alt="Vibelets" className="h-7 w-auto flex-shrink-0" />
        <div className="min-w-0">
          <h2 className="font-semibold text-sm text-foreground">Campaign Builder</h2>
          <p className="text-xs text-muted-foreground">AI-powered ad creation</p>
        </div>
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
              selectedAnswers={selectedAnswers}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Input with glass effect */}
      <div className="flex-shrink-0 border-t border-border/50 bg-background/30">
        <ChatInput onSend={onSendMessage} disabled={disabled || isTyping} />
      </div>
    </div>
  );
};