import { useState } from 'react';
import { ArrowRight, Check, X, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { onboardingQuizQuestions, advancedQuizQuestions, QuizQuestion } from '@/data/onboardingQuizData';
import { OnboardingAnswers } from '@/hooks/useUserState';

interface OnboardingQuizModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (answers: OnboardingAnswers) => void;
}

export const OnboardingQuizModal = ({ open, onClose, onComplete }: OnboardingQuizModalProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    generate_now: true,
    consent_personalization: true,
  });
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [inAdvanced, setInAdvanced] = useState(false);
  const [advancedStep, setAdvancedStep] = useState(0);

  if (!open) return null;

  const mainQuestions = onboardingQuizQuestions;
  const question = inAdvanced ? advancedQuizQuestions[advancedStep] : mainQuestions[step];
  const totalMain = mainQuestions.length;
  const isLastMain = step === totalMain - 1;
  const progress = inAdvanced ? 100 : ((step + 1) / totalMain) * 100;

  if (!question) return null;

  const advanceStep = (currentAnswers: Record<string, any>) => {
    if (inAdvanced) {
      if (advancedStep < advancedQuizQuestions.length - 1) {
        setAdvancedStep(prev => prev + 1);
        setMultiSelections([]);
      } else {
        onComplete(currentAnswers as OnboardingAnswers);
        onClose();
      }
    } else if (isLastMain) {
      onComplete(currentAnswers as OnboardingAnswers);
      onClose();
    } else {
      setStep(prev => prev + 1);
      setMultiSelections([]);
    }
  };

  const handleSelect = (value: string) => {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-card shadow-2xl p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Quick setup</p>
              <p className="text-[10px] text-muted-foreground">
                {inAdvanced
                  ? `Advanced ${advancedStep + 1} of ${advancedQuizQuestions.length}`
                  : `${step + 1} of ${totalMain}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Skip & use defaults
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <div>
          {inAdvanced && advancedStep === 0 && (
            <p className="text-xs text-primary font-medium mb-1">Advanced preferences</p>
          )}
          <h3 className="text-base font-semibold text-foreground">{question.label}</h3>
          {question.help && (
            <p className="text-xs text-muted-foreground mt-1">{question.help}</p>
          )}
        </div>

        {question.type === 'boolean' ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => handleBooleanToggle(val)}
                  className={cn(
                    "flex-1 p-4 rounded-xl border text-center transition-all",
                    (answers[question.id] ?? question.default) === val
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/40 hover:border-border hover:bg-muted/20"
                  )}
                >
                  <span className="text-2xl block mb-1">{val ? '✅' : '⏭️'}</span>
                  <span className="text-sm font-medium text-foreground">{val ? 'Yes' : 'No, skip'}</span>
                </button>
              ))}
            </div>
            <button onClick={handleBooleanContinue} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className={cn(
              "grid gap-2.5",
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
                      "relative flex items-start gap-2.5 p-3.5 rounded-xl border text-left transition-all",
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/40 hover:border-border hover:bg-muted/20"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    {opt.emoji && <span className="text-lg mt-0.5">{opt.emoji}</span>}
                    <div>
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                      {opt.desc && (
                        <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">{opt.desc}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {question.type === 'multiselect' && (
              <button
                onClick={handleContinueMulti}
                disabled={multiSelections.length === 0}
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
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

        {/* Advanced link on last main question */}
        {!inAdvanced && isLastMain && (
          <button
            onClick={() => { setInAdvanced(true); setAdvancedStep(0); setMultiSelections([]); }}
            className="flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mx-auto"
          >
            <span>Answer advanced questions to tune recommendations</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
