import { useState, useEffect } from 'react';
import { Star, Sparkles, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface PostPublishFeedbackPanelProps {
  campaignName?: string;
  onComplete: () => void;
  onSkipToResults: () => void;
}

const lowRatingReasons = [
  "Confusing flow",
  "Too many steps",
  "Slow response",
  "Unclear options",
  "Missing features",
  "Technical issues"
];

const quickTags = [
  { label: "Super easy", icon: "✨" },
  { label: "Fast process", icon: "⚡" },
  { label: "Great AI suggestions", icon: "🤖" },
  { label: "Loved the creatives", icon: "🎨" }
];

const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent'
};

export const PostPublishFeedbackPanel = ({
  campaignName = "Your campaign",
  onComplete,
  onSkipToResults
}: PostPublishFeedbackPanelProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Trigger confetti celebration on mount
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#6ebc46', '#5d58a6', '#fbbf24', '#60a5fa'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors
    });

    frame();
  }, []);

  const handleRatingClick = (value: number) => {
    setRating(value);
    setShowFeedbackForm(true);
  };

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    console.log('Post-publish feedback:', { 
      rating, 
      feedback, 
      reasons: selectedReasons,
      tags: selectedTags 
    });
    
    sessionStorage.setItem('vibelets_publish_feedback_submitted', 'true');
    setSubmitted(true);
    toast.success('Thank you for your feedback!');
    
    // Auto-transition to results after brief delay
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleSkip = () => {
    sessionStorage.setItem('vibelets_publish_feedback_submitted', 'skipped');
    onComplete();
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-secondary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Thank you!</h2>
        <p className="text-muted-foreground text-center">
          Taking you to your campaign results...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Success Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-secondary/10 to-primary/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Campaign Published!</h2>
            <p className="text-sm text-muted-foreground">{campaignName} is now live on Facebook</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* 24-48 Hour Notice */}
        <div className="p-4 mx-4 mt-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">What happens next?</h3>
              <p className="text-sm text-muted-foreground">
                Your campaign is now running! AI-powered optimization recommendations will start appearing in <span className="text-primary font-medium">24-48 hours</span> once we gather enough performance data.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="p-4 mx-4 mt-4 rounded-xl glass-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">How was your experience?</h3>
                <p className="text-sm text-muted-foreground">Help us improve Vibelets</p>
              </div>
            </div>
            <button 
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>

          {/* Star Rating */}
          <TooltipProvider delayDuration={200}>
            <div className="flex justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Tooltip key={star}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all duration-200 hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-10 w-10 transition-all duration-200 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-muted-foreground/40 hover:text-muted-foreground'
                        }`}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {star} - {ratingLabels[star]}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
          <p className="text-center text-sm text-muted-foreground mb-4">
            Tap a star to rate your campaign creation experience
          </p>

          {/* Feedback Form - Shows after rating */}
          {showFeedbackForm && (
            <div className="animate-fade-in space-y-4 pt-4 border-t border-border/50">
              {/* High rating: Quick tags */}
              {rating >= 4 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">What did you love?</p>
                  <div className="flex flex-wrap gap-2">
                    {quickTags.map((tag) => (
                      <button
                        key={tag.label}
                        onClick={() => handleTagToggle(tag.label)}
                        className={`px-3 py-2 rounded-full text-sm transition-all duration-200 ${
                          selectedTags.includes(tag.label)
                            ? 'bg-secondary/20 text-secondary border border-secondary/30 scale-105'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent'
                        }`}
                      >
                        <span className="mr-1.5">{tag.icon}</span>
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Low rating: Reason chips */}
              {rating < 4 && rating > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">What could we improve?</p>
                  <div className="flex flex-wrap gap-2">
                    {lowRatingReasons.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => handleReasonToggle(reason)}
                        className={`px-3 py-2 rounded-full text-sm transition-all duration-200 ${
                          selectedReasons.includes(reason)
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 scale-105'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional text feedback for lower ratings */}
              {rating < 4 && rating > 0 && (
                <Textarea
                  placeholder="Tell us more (optional)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="resize-none h-20 bg-background/50"
                />
              )}

              <Button 
                onClick={handleSubmit}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                Submit Feedback
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-border/50 bg-background/50">
        <Button 
          variant="outline" 
          onClick={onSkipToResults}
          className="w-full gap-2"
        >
          View Campaign Results
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          You can always come back to check performance later
        </p>
      </div>
    </div>
  );
};
