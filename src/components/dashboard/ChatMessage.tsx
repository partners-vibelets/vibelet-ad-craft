import { Message } from '@/types/campaign';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { InlineQuestionCard } from './InlineQuestionCard';

interface ChatMessageProps {
  message: Message;
  onQuestionAnswer?: (questionId: string, answerId: string) => void;
  selectedAnswers?: Record<string, string>;
}

export const ChatMessage = ({ message, onQuestionAnswer, selectedAnswers = {} }: ChatMessageProps) => {
  const isAssistant = message.role === 'assistant';
  
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className={cn("break-words", i > 0 && "mt-2")} style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('•') || part.startsWith('✅')) {
              return <span key={j} className="text-primary">{part}</span>;
            }
            return part;
          })}
        </p>
      );
    });
  };
  
  return (
    <div className={cn(
      "flex gap-3 p-4 animate-fade-in",
      isAssistant ? "bg-muted/30" : "bg-transparent"
    )}>
      <div className={cn(
        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
        isAssistant ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
      )}>
        {isAssistant ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {isAssistant ? 'Vibelets AI' : 'You'}
        </p>
        <div className="text-sm text-foreground leading-relaxed">
          {renderContent(message.content)}
        </div>
        {message.inlineQuestion && onQuestionAnswer && (
          <InlineQuestionCard
            question={message.inlineQuestion}
            onAnswer={onQuestionAnswer}
            selectedAnswer={selectedAnswers[message.inlineQuestion.id]}
          />
        )}
      </div>
    </div>
  );
};
