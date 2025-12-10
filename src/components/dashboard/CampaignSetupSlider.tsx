import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Target, MousePointer, DollarSign, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SliderQuestion {
  id: string;
  label: string;
  icon: React.ElementType;
  options: { id: string; label: string; description?: string }[];
}

const questions: SliderQuestion[] = [
  {
    id: 'objective',
    label: 'Campaign Goal',
    icon: Target,
    options: [
      { id: 'Sales', label: 'Sales', description: 'Drive purchases' },
      { id: 'Lead Generation', label: 'Leads', description: 'Collect leads' },
      { id: 'Website Traffic', label: 'Traffic', description: 'Send visitors' },
      { id: 'Brand Awareness', label: 'Awareness', description: 'Reach people' },
    ]
  },
  {
    id: 'cta',
    label: 'Call-to-Action',
    icon: MousePointer,
    options: [
      { id: 'Shop Now', label: 'Shop Now' },
      { id: 'Learn More', label: 'Learn More' },
      { id: 'Sign Up', label: 'Sign Up' },
      { id: 'Get Offer', label: 'Get Offer' },
    ]
  },
  {
    id: 'budget',
    label: 'Daily Budget',
    icon: DollarSign,
    options: [
      { id: '25', label: '$25/day', description: 'Starter' },
      { id: '50', label: '$50/day', description: 'Recommended' },
      { id: '100', label: '$100/day', description: 'Growth' },
      { id: '200', label: '$200/day', description: 'Scale' },
    ]
  },
  {
    id: 'duration',
    label: 'Duration',
    icon: Calendar,
    options: [
      { id: '7', label: '7 days', description: 'Quick test' },
      { id: '14', label: '14 days', description: 'Standard' },
      { id: '30', label: '30 days', description: 'Extended' },
      { id: 'ongoing', label: 'Ongoing', description: 'Until paused' },
    ]
  }
];

interface CampaignSetupSliderProps {
  onComplete: (config: Record<string, string>) => void;
  disabled?: boolean;
}

export const CampaignSetupSlider = ({ onComplete, disabled }: CampaignSetupSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  const handleSelect = (optionId: string) => {
    if (disabled || isComplete) return;
    
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    // Auto-advance after a brief delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsComplete(true);
        onComplete(newAnswers);
      }
    }, 300);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isComplete) {
    return (
      <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/5 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Campaign configured!</p>
            <p className="text-xs text-muted-foreground">
              {answers.objective} • ${answers.budget}/day • {answers.duration === 'ongoing' ? 'Ongoing' : `${answers.duration} days`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {Object.keys(answers).length}/{questions.length}
        </span>
      </div>

      {/* Question card */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <button
                onClick={goBack}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <currentQuestion.icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{currentQuestion.label}</span>
          </div>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  i === currentIndex ? "bg-primary" : 
                  i < currentIndex ? "bg-primary/50" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Options grid */}
        <div className="p-3 grid grid-cols-2 gap-2">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={disabled}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
