import { Message } from '@/types/campaign';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAssistant = message.role === 'assistant';
  
  return (
    <div className={cn(
      "flex gap-3 p-4 animate-fade-in",
      isAssistant ? "bg-muted/30" : "bg-transparent"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isAssistant ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
      )}>
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          {isAssistant ? 'Vibelets AI' : 'You'}
        </p>
        <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {message.content.split('\n').map((line, i) => {
            // Handle bold text
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} className={i > 0 ? "mt-2" : ""}>
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};
