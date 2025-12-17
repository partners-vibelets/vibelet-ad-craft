import { useState } from 'react';
import { Star, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RecommendationRatingProps {
  recommendationId: string;
  compact?: boolean;
  onRate?: (id: string, rating: number, feedback?: string, reasons?: string[]) => void;
}

const lowRatingReasons = [
  'Not relevant',
  'Already tried',
  'Too risky',
  'Budget concern',
  'Unclear impact',
];

export const RecommendationRating = ({ 
  recommendationId, 
  compact = false,
  onRate 
}: RecommendationRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [showReasons, setShowReasons] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRatingClick = (value: number) => {
    setRating(value);
    if (value < 3) {
      setShowReasons(true);
    } else {
      submitRating(value);
    }
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const submitRating = (ratingValue: number, reasons?: string[], feedback?: string) => {
    onRate?.(recommendationId, ratingValue, feedback, reasons);
    setSubmitted(true);
    toast.success('Thanks for your feedback!', {
      description: 'This helps us improve recommendations.',
      duration: 2000
    });
  };

  const handleSubmitWithReasons = () => {
    submitRating(rating, selectedReasons.length > 0 ? selectedReasons : undefined, additionalFeedback || undefined);
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

  if (showReasons) {
    return (
      <div className="space-y-3 animate-fade-in">
        <p className="text-sm text-muted-foreground">What could be better?</p>
        
        {/* Quick reason chips */}
        <div className="flex flex-wrap gap-1.5">
          {lowRatingReasons.map((reason) => (
            <button
              key={reason}
              onClick={() => toggleReason(reason)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs transition-all duration-200 border",
                selectedReasons.includes(reason)
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {reason}
            </button>
          ))}
        </div>

        {/* Optional additional feedback */}
        <Textarea
          value={additionalFeedback}
          onChange={(e) => setAdditionalFeedback(e.target.value)}
          placeholder="Anything else? (optional)"
          className="min-h-[50px] text-xs resize-none bg-muted/30"
          maxLength={200}
        />

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => submitRating(rating)}
            className="h-7 text-xs text-muted-foreground"
          >
            Skip
          </Button>
          <Button
            size="sm"
            onClick={handleSubmitWithReasons}
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
        Rate this
      </span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleRatingClick(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className={cn(
              "p-0.5 transition-all duration-200 hover:scale-110",
              "focus:outline-none rounded"
            )}
          >
            <Star
              className={cn(
                "transition-all duration-200",
                compact ? "w-4 h-4" : "w-5 h-5",
                (hoveredRating || rating) >= value
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]"
                  : "text-muted-foreground/40 hover:text-amber-400/60"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
