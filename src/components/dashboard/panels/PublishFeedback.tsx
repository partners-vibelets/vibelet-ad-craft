import { useState } from 'react';
import { Sparkles, Send, Check, Heart, Zap, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
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

const lowRatingReasons = [
  'Confusing flow',
  'Too many steps',
  'Slow performance',
  'Missing features',
  'AI suggestions unhelpful',
  'Unexpected results',
];

export const PublishFeedback = ({ onSubmit, onDismiss }: PublishFeedbackProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    setShowFeedbackForm(true);
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
      <div className="flex justify-center py-4">
        <StarRating
          value={rating}
          onChange={handleRatingClick}
          size="lg"
        />
      </div>

      {/* Initial prompt if not rated yet */}
      {!showFeedbackForm && !rating && (
        <p className="text-center text-sm text-muted-foreground">
          Tap a star to rate your experience
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

          {/* Quick reason chips for lower ratings */}
          {rating < 4 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">What could we improve?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {lowRatingReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => toggleReason(reason)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-all duration-200 border",
                      selectedReasons.includes(reason)
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Anything else? (optional)"
                className="min-h-[60px] text-sm resize-none bg-muted/30"
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
    </div>
  );
};
