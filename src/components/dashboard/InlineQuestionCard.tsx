import { InlineQuestion, QuestionOption } from '@/types/campaign';
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
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onAnswer(question.id, option.id)}
              className={cn(
                "group relative flex flex-col items-start p-3 rounded-lg border text-left transition-all min-w-[140px] max-w-[200px]",
                isSelected 
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {option.label}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
              {option.description && (
                <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
