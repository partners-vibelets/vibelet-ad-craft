import { InlineQuestion } from '@/types/campaign';
import { cn } from '@/lib/utils';
import { Check, Zap, Target, TrendingUp, ShoppingCart, Users, Video, Image, Sparkles, Play, DollarSign, Calendar, MousePointer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  zap: Zap,
  target: Target,
  trending: TrendingUp,
  cart: ShoppingCart,
  users: Users,
  video: Video,
  image: Image,
  sparkles: Sparkles,
  play: Play,
  dollar: DollarSign,
  calendar: Calendar,
  click: MousePointer,
};

// Questions that should use compact side-by-side layout
const COMPACT_QUESTIONS = ['product-continue'];

// Questions that should use conversational chip layout (many options, preview shows details)
const CONVERSATIONAL_QUESTIONS = ['script-selection', 'avatar-selection', 'creative-selection', 'ad-account-selection'];

interface InlineQuestionCardProps {
  question: InlineQuestion;
  onAnswer: (questionId: string, answerId: string) => void;
  selectedAnswer?: string;
}

export const InlineQuestionCard = ({ question, onAnswer, selectedAnswer }: InlineQuestionCardProps) => {
  const isCompact = COMPACT_QUESTIONS.includes(question.id);
  const isConversational = CONVERSATIONAL_QUESTIONS.includes(question.id);

  // Compact side-by-side layout for binary choices
  if (isCompact) {
    return (
      <div className="mt-3 space-y-2 overflow-hidden animate-fade-in">
        <p className="text-sm font-medium text-foreground break-words">{question.question}</p>
        <div className="flex flex-wrap gap-2">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => onAnswer(question.id, option.id)}
                disabled={!!selectedAnswer}
                style={{ animationDelay: `${index * 50}ms` }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 animate-fade-in",
                  isSelected 
                    ? "border-primary bg-primary/10 text-primary"
                    : selectedAnswer
                      ? "border-border/50 bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed"
                      : "border-border bg-card hover:border-primary/60 hover:bg-primary/5 cursor-pointer text-foreground"
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Conversational chip layout - just names, details in preview panel
  if (isConversational) {
    return (
      <div className="mt-3 space-y-2 overflow-hidden animate-fade-in">
        <p className="text-sm font-medium text-foreground break-words">{question.question}</p>
        <p className="text-xs text-muted-foreground">Check the preview panel for details, then select:</p>
        <div className="flex flex-wrap gap-1.5">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option.id;
            const isCustomOption = option.id.includes('custom');
            
            return (
              <button
                key={option.id}
                onClick={() => onAnswer(question.id, option.id)}
                disabled={!!selectedAnswer}
                style={{ animationDelay: `${index * 30}ms` }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 animate-fade-in",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : selectedAnswer
                      ? "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                      : isCustomOption
                        ? "bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 cursor-pointer"
                        : "bg-muted hover:bg-muted/80 text-foreground cursor-pointer hover:shadow-sm"
                )}
              >
                {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: standard card layout for other questions
  return (
    <div className="mt-3 space-y-2 overflow-hidden animate-fade-in">
      <p className="text-sm font-medium text-foreground break-words">{question.question}</p>
      <div className="flex flex-col gap-1.5">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option.id;
          const IconComponent = option.icon ? iconMap[option.icon] : null;
          
          return (
            <button
              key={option.id}
              onClick={() => onAnswer(question.id, option.id)}
              disabled={!!selectedAnswer}
              style={{ animationDelay: `${index * 50}ms` }}
              className={cn(
                "group relative flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all duration-200 w-full overflow-hidden animate-fade-in",
                isSelected 
                  ? "border-primary bg-primary/10 shadow-sm"
                  : selectedAnswer
                    ? "border-border/50 bg-muted/30 opacity-50 cursor-not-allowed"
                    : "border-border bg-card hover:border-primary/60 hover:bg-primary/5 hover:shadow-sm cursor-pointer"
              )}
            >
              {/* Icon or Radio */}
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 transition-all duration-200",
                isSelected 
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5" />
                ) : IconComponent ? (
                  <IconComponent className="w-3.5 h-3.5" />
                ) : (
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full border-2 transition-colors",
                    "border-muted-foreground/40 group-hover:border-primary"
                  )} />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <span className={cn(
                  "text-sm font-medium block truncate transition-colors",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {option.label}
                </span>
                {option.description && (
                  <span className={cn(
                    "text-xs block truncate transition-colors",
                    isSelected ? "text-primary/70" : "text-muted-foreground"
                  )}>
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
