import { Check, Circle } from 'lucide-react';
import { CreateTemplate, CollectedInput } from '@/types/create';
import { cn } from '@/lib/utils';

interface InputProgressProps {
  template: CreateTemplate;
  collectedInputs: CollectedInput[];
}

export const InputProgress = ({ template, collectedInputs }: InputProgressProps) => {
  const collectedIds = collectedInputs.map(i => i.inputId);
  const allRequiredInputs = template.requiredInputs;
  const completedCount = allRequiredInputs.filter(i => collectedIds.includes(i.id)).length;
  const totalRequired = allRequiredInputs.length;

  return (
    <div className="p-4 bg-muted/50 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">
          Progress
        </span>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalRequired} required
        </span>
      </div>

      <div className="space-y-2">
        {allRequiredInputs.map((input) => {
          const isCompleted = collectedIds.includes(input.id);
          return (
            <div 
              key={input.id}
              className={cn(
                "flex items-center gap-2 text-sm",
                isCompleted ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span>{input.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${(completedCount / totalRequired) * 100}%` }}
        />
      </div>
    </div>
  );
};
