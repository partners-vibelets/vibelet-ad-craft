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

interface InlineQuestionCardProps {
  question: InlineQuestion;
  onAnswer: (questionId: string, answerId: string) => void;
  selectedAnswer?: string;
}

export const InlineQuestionCard = ({ question, onAnswer, selectedAnswer }: InlineQuestionCardProps) => {
  return (
    <div className="mt-4 space-y-3 overflow-hidden animate-fade-in">
      <p className="text-sm font-medium text-foreground break-words">{question.question}</p>
      <div className="flex flex-col gap-2">
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
                "group relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 w-full overflow-hidden animate-fade-in",
                isSelected 
                  ? "border-primary bg-primary/10 shadow-sm"
                  : selectedAnswer
                    ? "border-border/50 bg-muted/30 opacity-50 cursor-not-allowed"
                    : "border-border bg-card hover:border-primary/60 hover:bg-primary/5 hover:shadow-sm cursor-pointer"
              )}
            >
              {/* Icon or Radio */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200",
                isSelected 
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                {isSelected ? (
                  <Check className="w-4 h-4" />
                ) : IconComponent ? (
                  <IconComponent className="w-4 h-4" />
                ) : (
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 transition-colors",
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
                    "text-xs block truncate transition-colors mt-0.5",
                    isSelected ? "text-primary/70" : "text-muted-foreground"
                  )}>
                    {option.description}
                  </span>
                )}
              </div>
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary animate-scale-in" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
