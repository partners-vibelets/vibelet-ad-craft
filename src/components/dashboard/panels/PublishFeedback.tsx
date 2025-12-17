import { useState } from 'react';
import { Star, Sparkles, Send, Check, MessageCircle, Heart, Zap, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PublishFeedbackProps {
  onSubmit?: (rating: number, feedback?: string, tags?: string[]) => void;
  onDismiss?: () => void;
}

const quickTags = [
  { label: 'Easy to use', icon: Zap },
  { label: 'Fast', icon: Rocket },
  { label: 'Great AI', icon: Sparkles },
  { label: 'Love it', icon: Heart },
];

export const PublishFeedback = ({ onSubmit, onDismiss }: PublishFeedbackProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleRatingClick = (value: number) => {
    setRating(value);
    if (value >= 4) {
      // High rating - show quick tags
      setShowFeedbackForm(true);
    } else {
      // Lower rating - show feedback form
      setShowFeedbackForm(true);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    onSubmit?.(rating, feedback || undefined, selectedTags.length > 0 ? selectedTags : undefined);
    setIsSubmitted(true);
    toast.success('Thanks for your feedback!', {
      description: 'Your input helps us improve Vibelets.',
      duration: 3000
    });
  };

  if (isSubmitted) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in text-center">
        <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-secondary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Thank you!</h3>
        <p className="text-sm text-muted-foreground">Your feedback makes Vibelets better</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">How was your experience?</h3>
            <p className="text-sm text-muted-foreground">Help us improve Vibelets</p>
          </div>
        </div>
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground h-8 px-2"
          >
            Skip
          </Button>
        )}
      </div>

      {/* Star Rating */}
      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleRatingClick(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className={cn(
              "p-1 transition-all duration-200 hover:scale-125",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full"
            )}
          >
            <Star
              className={cn(
                "w-8 h-8 transition-all duration-200",
                (hoveredRating || rating) >= value
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                  : "text-muted-foreground/40 hover:text-amber-400/60"
              )}
            />
          </button>
        ))}
      </div>

      {/* Rating Label */}
      {(hoveredRating || rating) > 0 && (
        <p className={cn(
          "text-center text-sm mb-4 transition-all duration-200",
          (hoveredRating || rating) >= 4 ? "text-secondary" : "text-muted-foreground"
        )}>
          {(hoveredRating || rating) === 5 && "Amazing! 🎉"}
          {(hoveredRating || rating) === 4 && "Great!"}
          {(hoveredRating || rating) === 3 && "Good"}
          {(hoveredRating || rating) === 2 && "Could be better"}
          {(hoveredRating || rating) === 1 && "Needs work"}
        </p>
      )}

      {/* Feedback Form (shown after rating) */}
      {showFeedbackForm && (
        <div className="space-y-4 animate-fade-in border-t border-border/30 pt-4 mt-2">
          {/* Quick Tags for high ratings */}
          {rating >= 4 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {quickTags.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => toggleTag(label)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                    "border",
                    selectedTags.includes(label)
                      ? "bg-secondary/20 border-secondary/50 text-secondary"
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:border-secondary/30 hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Text feedback for lower ratings */}
          {rating < 4 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>What could we improve?</span>
              </div>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[80px] text-sm resize-none bg-muted/30"
                maxLength={500}
              />
            </div>
          )}

          {/* Optional text for high ratings */}
          {rating >= 4 && (
            <div className="space-y-2">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Anything else you'd like to share? (optional)"
                className="min-h-[60px] text-sm resize-none bg-muted/30"
                maxLength={500}
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Feedback
          </Button>
        </div>
      )}

      {/* Initial prompt if not rated yet */}
      {!showFeedbackForm && !rating && (
        <p className="text-center text-sm text-muted-foreground">
          Tap a star to rate your campaign creation experience
        </p>
      )}
    </div>
  );
};
