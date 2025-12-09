import { InlineQuestion } from '@/types/campaign';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface InlineQuestionCardProps {
  question: InlineQuestion;
  onAnswer: (questionId: string, answerId: string) => void;
  selectedAnswer?: string;
}

export const InlineQuestionCard = ({ question, onAnswer, selectedAnswer }: InlineQuestionCardProps) => {
  return (
    <div className="mt-3 space-y-2 overflow-hidden">
      <p className="text-xs font-medium text-muted-foreground break-words">{question.question}</p>
      <div className="flex flex-col gap-1.5">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onAnswer(question.id, option.id)}
              className={cn(
                "group relative flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all w-full overflow-hidden",
                isSelected 
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                isSelected 
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/50"
              )}>
                {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <span className={cn(
                  "text-sm font-medium block truncate",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-muted-foreground block truncate">
                    {option.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
