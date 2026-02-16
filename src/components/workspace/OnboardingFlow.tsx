import { useState } from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: { id: string; emoji: string; label: string; desc: string }[];
  multi?: boolean;
}

const questions: OnboardingQuestion[] = [
  {
    id: 'business_type',
    question: "What best describes your business?",
    subtitle: "This helps me tailor campaigns and creatives to your industry.",
    options: [
      { id: 'ecommerce', emoji: '🛍️', label: 'E-commerce / DTC', desc: 'Online store selling products' },
      { id: 'saas', emoji: '💻', label: 'SaaS / Software', desc: 'Digital product or subscription' },
      { id: 'services', emoji: '🏢', label: 'Services / Agency', desc: 'Professional or local services' },
      { id: 'creator', emoji: '🎨', label: 'Creator / Personal Brand', desc: 'Content, coaching, courses' },
    ],
  },
  {
    id: 'ad_experience',
    question: "How experienced are you with digital ads?",
    subtitle: "I'll adjust my guidance level based on your comfort zone.",
    options: [
      { id: 'beginner', emoji: '🌱', label: "I'm brand new", desc: 'Never run ads before' },
      { id: 'some', emoji: '📈', label: 'Some experience', desc: 'Ran a few campaigns' },
      { id: 'experienced', emoji: '🚀', label: 'Pretty experienced', desc: 'Run ads regularly' },
      { id: 'expert', emoji: '🏆', label: 'Expert / Agency', desc: 'Manage multiple accounts' },
    ],
  },
  {
    id: 'goals',
    question: "What's your primary goal right now?",
    subtitle: "I'll prioritize features and suggestions based on what matters most.",
    multi: true,
    options: [
      { id: 'launch', emoji: '🚀', label: 'Launch my first campaign', desc: 'Get ads live quickly' },
      { id: 'scale', emoji: '📊', label: "Scale what's working", desc: 'Grow existing campaigns' },
      { id: 'creative', emoji: '🎬', label: 'Create better ads', desc: 'Images, videos, copy' },
      { id: 'optimize', emoji: '⚡', label: 'Reduce wasted spend', desc: 'Improve performance' },
    ],
  },
  {
    id: 'platforms',
    question: "Where do you advertise (or want to)?",
    subtitle: "We'll set up integrations and tailor strategies for these platforms.",
    multi: true,
    options: [
      { id: 'facebook', emoji: '📘', label: 'Facebook', desc: 'Meta Ads Manager' },
      { id: 'instagram', emoji: '📸', label: 'Instagram', desc: 'Reels, Stories, Feed' },
      { id: 'google', emoji: '🔍', label: 'Google Ads', desc: 'Search, Display, YouTube' },
      { id: 'tiktok', emoji: '🎵', label: 'TikTok', desc: 'Short-form video ads' },
    ],
  },
  {
    id: 'monthly_spend',
    question: "What's your typical monthly ad budget?",
    subtitle: "This helps me set realistic expectations and strategies.",
    options: [
      { id: 'starter', emoji: '🌱', label: 'Under $1,000', desc: 'Getting started' },
      { id: 'growing', emoji: '📈', label: '$1,000 – $5,000', desc: 'Growing steadily' },
      { id: 'scaling', emoji: '🚀', label: '$5,000 – $25,000', desc: 'Scaling up' },
      { id: 'enterprise', emoji: '🏢', label: '$25,000+', desc: 'Enterprise level' },
    ],
  },
];

export interface OnboardingData {
  business_type?: string;
  ad_experience?: string;
  goals?: string[];
  platforms?: string[];
  monthly_spend?: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  userName?: string;
}

export const OnboardingFlow = ({ onComplete, userName }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingData>({});
  const [selections, setSelections] = useState<string[]>([]);

  const question = questions[currentStep];
  const isLast = currentStep === questions.length - 1;
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSelect = (optionId: string) => {
    if (question.multi) {
      setSelections(prev =>
        prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
      );
    } else {
      // Single select — auto-advance
      const newAnswers = { ...answers, [question.id]: optionId };
      setAnswers(newAnswers);
      if (isLast) {
        onComplete(newAnswers);
      } else {
        setCurrentStep(prev => prev + 1);
        setSelections([]);
      }
    }
  };

  const handleContinue = () => {
    if (question.multi && selections.length > 0) {
      const newAnswers = { ...answers, [question.id]: selections };
      setAnswers(newAnswers);
      if (isLast) {
        onComplete(newAnswers);
      } else {
        setCurrentStep(prev => prev + 1);
        setSelections([]);
      }
    }
  };

  const handleSkip = () => {
    if (isLast) {
      onComplete(answers);
    } else {
      setCurrentStep(prev => prev + 1);
      setSelections([]);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
      <div className="max-w-lg w-full space-y-8 animate-fade-in">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{currentStep + 1} of {questions.length}</span>
            <button onClick={handleSkip} className="hover:text-foreground transition-colors">
              Skip
            </button>
          </div>
          <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          {currentStep === 0 && (
            <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          )}
          {currentStep === 0 && (
            <p className="text-sm text-muted-foreground">
              {userName ? `Hey ${userName.split(' ')[0]}! ` : ''}A few quick questions so I can personalize everything for you.
            </p>
          )}
          <h2 className="text-xl font-semibold text-foreground">{question.question}</h2>
          <p className="text-sm text-muted-foreground">{question.subtitle}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {question.options.map(opt => {
            const isSelected = question.multi
              ? selections.includes(opt.id)
              : answers[question.id as keyof OnboardingData] === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={cn(
                  "relative flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all duration-200",
                  isSelected
                    ? "border-primary/40 bg-primary/5 shadow-sm"
                    : "border-border/50 bg-card/50 hover:border-border hover:bg-muted/30"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground leading-snug">{opt.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Continue button for multi-select */}
        {question.multi && (
          <button
            onClick={handleContinue}
            disabled={selections.length === 0}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all",
              selections.length > 0
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
            )}
          >
            {isLast ? "Let's go" : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
