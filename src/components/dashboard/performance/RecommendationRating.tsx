import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, X, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RecommendationRatingProps {
  recommendationId: string;
  compact?: boolean;
  onRate?: (id: string, rating: 'helpful' | 'not-helpful', feedback?: string) => void;
}

export const RecommendationRating = ({ 
  recommendationId, 
  compact = false,
  onRate 
}: RecommendationRatingProps) => {
  const [rating, setRating] = useState<'helpful' | 'not-helpful' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (value: 'helpful' | 'not-helpful') => {
    setRating(value);
    if (value === 'not-helpful') {
      setShowFeedback(true);
    } else {
      submitRating(value);
    }
  };

  const submitRating = (ratingValue: 'helpful' | 'not-helpful', feedbackText?: string) => {
    onRate?.(recommendationId, ratingValue, feedbackText);
    setSubmitted(true);
    setShowFeedback(false);
    toast.success('Thanks for your feedback!', {
      description: 'This helps us improve recommendations.',
      duration: 2000
    });
  };

  const handleSubmitFeedback = () => {
    submitRating(rating!, feedback);
  };

  if (submitted) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-muted-foreground",
        compact ? "text-xs" : "text-sm"
      )}>
        <Sparkles className={cn("text-secondary", compact ? "h-3 w-3" : "h-4 w-4")} />
        <span>Thanks for the feedback</span>
      </div>
    );
  }

  if (showFeedback) {
    return (
      <div className="space-y-2 animate-fade-in">
        <div className="flex items-start gap-2">
          <MessageCircle className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What could be better?"
            className="min-h-[60px] text-sm resize-none bg-muted/30"
            maxLength={200}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowFeedback(false);
              submitRating(rating!);
            }}
            className="h-7 text-xs text-muted-foreground"
          >
            Skip
          </Button>
          <Button
            size="sm"
            onClick={handleSubmitFeedback}
            disabled={!feedback.trim()}
            className="h-7 text-xs bg-primary hover:bg-primary/90"
          >
            <Check className="h-3 w-3 mr-1" />
            Send
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 transition-all duration-300",
      compact ? "pt-2" : "pt-3 border-t border-border/30"
    )}>
      <span className={cn(
        "text-muted-foreground",
        compact ? "text-xs" : "text-sm"
      )}>
        Was this helpful?
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRate('helpful')}
          className={cn(
            "group transition-all duration-200",
            compact ? "h-7 w-7 p-0" : "h-8 w-8 p-0",
            rating === 'helpful' && "bg-secondary/20 text-secondary"
          )}
        >
          <ThumbsUp className={cn(
            "transition-transform group-hover:scale-110",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
            rating === 'helpful' ? "fill-secondary text-secondary" : "text-muted-foreground group-hover:text-secondary"
          )} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRate('not-helpful')}
          className={cn(
            "group transition-all duration-200",
            compact ? "h-7 w-7 p-0" : "h-8 w-8 p-0",
            rating === 'not-helpful' && "bg-muted text-muted-foreground"
          )}
        >
          <ThumbsDown className={cn(
            "transition-transform group-hover:scale-110",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
            rating === 'not-helpful' ? "fill-muted-foreground" : "text-muted-foreground group-hover:text-foreground"
          )} />
        </Button>
      </div>
    </div>
  );
};
