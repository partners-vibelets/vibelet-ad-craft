import { useState, useEffect } from 'react';
import { ArrowRight, Check, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { onboardingQuizQuestions } from '@/data/homepageDemoData';
import { OnboardingAnswers } from '@/hooks/useUserState';

interface OnboardingQuizModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (answers: OnboardingAnswers) => void;
}

const optionEmojis: Record<string, string> = {
  sales: '💰', leads: '📋', awareness: '📣', app_installs: '📱',
  '<$500': '🌱', '$500-2.5k': '📈', '$2.5k-10k': '🚀', '>$10k': '🏢',
  Facebook: '📘', Instagram: '📸', TikTok: '🎵', Google: '🔍',
  yes: '✅', no: '❌',
  existing_customers: '🎯', lookalike: '🔄', interest_based: '🧲',
  UGC: '🎬', lifestyle: '🌿', demo: '📦',
};

export const OnboardingQuizModal = ({ open, onClose, onComplete }: OnboardingQuizModalProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [generateNow, setGenerateNow] = useState(true);

  useEffect(() => {
    if (!open) { setStep(0); setAnswers({}); setMultiSelections([]); }
  }, [open]);

  if (!open) return null;

  const questions = onboardingQuizQuestions;
  const isLastRegular = step === questions.length - 1; // generate_now question
  const question = questions[step];

  if (!question) return null;

  const handleSelect = (value: string) => {
    if (question.type === 'multiselect') {
      setMultiSelections(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    } else if (question.type === 'boolean') {
      // handled separately
    } else {
      const newAnswers = { ...answers, [question.id]: value };
      setAnswers(newAnswers);
      if (step < questions.length - 1) {
        setStep(step + 1);
        setMultiSelections([]);
      }
    }
  };

  const handleContinueMulti = () => {
    if (multiSelections.length === 0) return;
    const newAnswers = { ...answers, [question.id]: multiSelections };
    setAnswers(newAnswers);
    setStep(step + 1);
    setMultiSelections([]);
  };

  const handleFinish = () => {
    const finalAnswers = { ...answers, generate_now: generateNow };
    onComplete(finalAnswers as OnboardingAnswers);
    onClose();
  };

  const progress = ((step + 1) / questions.length) * 100;

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
              <p className="text-[10px] text-muted-foreground">{step + 1} of {questions.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <h3 className="text-base font-semibold text-foreground">{question.label}</h3>

        {question.type === 'boolean' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">I'll auto-create a campaign draft based on your answers</p>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => setGenerateNow(val)}
                  className={cn(
                    "flex-1 p-4 rounded-xl border text-center transition-all",
                    generateNow === val
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/40 hover:border-border hover:bg-muted/20"
                  )}
                >
                  <span className="text-2xl block mb-1">{val ? '🚀' : '⏳'}</span>
                  <span className="text-sm font-medium text-foreground">{val ? 'Yes, create it!' : 'Not now'}</span>
                </button>
              ))}
            </div>
            <button onClick={handleFinish} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
              Finish setup <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              {question.options?.map(opt => {
                const isSelected = question.type === 'multiselect'
                  ? multiSelections.includes(opt)
                  : answers[question.id] === opt;

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "relative flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all",
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
                    <span className="text-lg">{optionEmojis[opt] || '•'}</span>
                    <span className="text-sm font-medium text-foreground">{opt}</span>
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
      </div>
    </div>
  );
};
