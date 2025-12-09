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
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{question.question}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onAnswer(question.id, option.id)}
              className={cn(
                "group relative flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all w-full",
                isSelected 
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                isSelected 
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              )}>
                {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-sm font-medium block",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
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
