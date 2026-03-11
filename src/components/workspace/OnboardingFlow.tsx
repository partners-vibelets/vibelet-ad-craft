import { useState } from 'react';
import { Sparkles, ArrowRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { onboardingQuizQuestions, advancedQuizQuestions, QuizQuestion } from '@/data/onboardingQuizData';
import { OnboardingAnswers } from '@/hooks/useUserState';

export type { OnboardingAnswers as OnboardingData };

interface OnboardingFlowProps {
  onComplete: (data: OnboardingAnswers) => void;
  userName?: string;
}

export const OnboardingFlow = ({ onComplete, userName }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    generate_now: true,
    consent_personalization: true,
  });
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedStep, setAdvancedStep] = useState(0);
  const [inAdvanced, setInAdvanced] = useState(false);

  const mainQuestions = onboardingQuizQuestions;
  const question = inAdvanced ? advancedQuizQuestions[advancedStep] : mainQuestions[currentStep];
  const totalMain = mainQuestions.length;
  const isLastMain = currentStep === totalMain - 1;
  const progress = inAdvanced
    ? 100
    : ((currentStep + 1) / totalMain) * 100;

  const handleSelect = (value: string) => {
    if (!question) return;
    if (question.type === 'multiselect') {
      setMultiSelections(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    } else if (question.type === 'select') {
      const newAnswers = { ...answers, [question.id]: value };
      setAnswers(newAnswers);
      advanceStep(newAnswers);
    }
  };

  const advanceStep = (currentAnswers: Record<string, any>) => {
    if (inAdvanced) {
      if (advancedStep < advancedQuizQuestions.length - 1) {
        setAdvancedStep(prev => prev + 1);
        setMultiSelections([]);
      } else {
        onComplete(currentAnswers as OnboardingAnswers);
      }
    } else if (isLastMain) {
      onComplete(currentAnswers as OnboardingAnswers);
    } else {
      setCurrentStep(prev => prev + 1);
      setMultiSelections([]);
    }
  };

  const handleContinueMulti = () => {
    if (multiSelections.length === 0) return;
    const newAnswers = { ...answers, [question.id]: multiSelections };
    setAnswers(newAnswers);
    advanceStep(newAnswers);
  };

  const handleBooleanToggle = (value: boolean) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleBooleanContinue = () => {
    advanceStep(answers);
  };

  const handleSkip = () => {
    onComplete(answers as OnboardingAnswers);
  };

  const handleStartAdvanced = () => {
    setInAdvanced(true);
    setAdvancedStep(0);
    setMultiSelections([]);
  };

  if (!question) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
      <div className="max-w-lg w-full space-y-8 animate-fade-in">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {inAdvanced
                ? `Advanced ${advancedStep + 1} of ${advancedQuizQuestions.length}`
                : `${currentStep + 1} of ${totalMain}`}
            </span>
            <button onClick={handleSkip} className="hover:text-foreground transition-colors">
              Skip & use defaults
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
          {currentStep === 0 && !inAdvanced && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {userName ? `Hey ${userName.split(' ')[0]}! ` : ''}A few quick questions so I can personalize everything for you.
              </p>
            </>
          )}
          {inAdvanced && advancedStep === 0 && (
            <p className="text-xs text-primary font-medium">Advanced preferences</p>
          )}
          <h2 className="text-xl font-semibold text-foreground">{question.label}</h2>
          {question.help && (
            <p className="text-sm text-muted-foreground">{question.help}</p>
          )}
        </div>

        {/* Boolean type */}
        {question.type === 'boolean' ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => handleBooleanToggle(val)}
                  className={cn(
                    "flex-1 p-4 rounded-xl border text-center transition-all",
                    (answers[question.id] ?? question.default) === val
                      ? "border-primary/40 bg-primary/5 shadow-sm"
                      : "border-border/50 bg-card/50 hover:border-border hover:bg-muted/30"
                  )}
                >
                  <span className="text-2xl block mb-1">{val ? '✅' : '⏭️'}</span>
                  <span className="text-sm font-medium text-foreground">
                    {val ? 'Yes' : 'No, skip'}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={handleBooleanContinue}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Select / Multiselect options */}
            <div className={cn(
              "grid gap-3",
              question.options && question.options.length <= 3 ? "grid-cols-1" : "grid-cols-2"
            )}>
              {question.options?.map(opt => {
                const isSelected = question.type === 'multiselect'
                  ? multiSelections.includes(opt.value)
                  : answers[question.id] === opt.value;

                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "relative flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all duration-200",
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
                    {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                    <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    {opt.desc && (
                      <span className="text-[11px] text-muted-foreground leading-snug">{opt.desc}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Continue button for multi-select */}
            {question.type === 'multiselect' && (
              <button
                onClick={handleContinueMulti}
                disabled={multiSelections.length === 0}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all",
                  multiSelections.length > 0
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                )}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Advanced preferences link — show on the last main boolean question (consent) */}
        {!inAdvanced && isLastMain && (
          <button
            onClick={handleStartAdvanced}
            className="flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mx-auto"
          >
            <span>Answer a few advanced questions to tune recommendations</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
