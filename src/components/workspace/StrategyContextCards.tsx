import { Lightbulb, Clock, Shield, AlertTriangle, CheckCircle2, Edit3, RefreshCw, DollarSign, Zap, Info } from 'lucide-react';
import { Artifact } from '@/types/workspace';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StrategyContextCardsProps {
  artifact: Artifact;
  onArtifactAction?: (artifactId: string, action: string, payload?: any) => void;
}

export const StrategyContextCards = ({ artifact, onArtifactAction }: StrategyContextCardsProps) => {
  const d = artifact.data;
  const plan = d.strategyPlan || d;
  const rationale = plan.rationale || '';
  const learningNotes = plan.learningPhaseNotes || '';
  const guardrails = plan.guardrailNotes || [];
  const budgetPlan = plan.budgetPlan || [];
  const flags = plan.flags || [];
  const executionSteps = plan.executionSteps || [];

  const hasContent = rationale || learningNotes || guardrails.length > 0 || budgetPlan.length > 0;
  if (!hasContent) return null;

  return (
    <div className="space-y-3 pl-9 animate-fade-in">
      {/* Rationale */}
      {rationale && (
        <div className="rounded-xl border border-border/40 bg-card/80 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 font-medium">
            <Lightbulb className="w-3.5 h-3.5" /> Structure Rationale
          </p>
          <p className="text-[13px] text-foreground/85 leading-relaxed">{rationale}</p>
        </div>
      )}

      {/* Budget Plan */}
      {budgetPlan.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/80 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2 font-medium">
            <DollarSign className="w-3.5 h-3.5" /> Budget Allocation
          </p>
          <div className="space-y-1.5">
            {budgetPlan.map((item: any, i: number) => (
              <div key={i} className={cn(
                "flex items-center gap-3 py-1.5 px-2 rounded-md text-[12px]",
                item.isTotal ? "bg-primary/5 font-medium" : ""
              )}>
                <span className={cn("flex-1 truncate", item.isTotal ? "text-foreground font-semibold" : "text-foreground/80")}>
                  {item.entity}
                </span>
                <span className="text-foreground font-medium tabular-nums shrink-0">{item.budget}</span>
                {item.rationale && (
                  <span className="text-muted-foreground/60 text-[10px] max-w-[140px] truncate shrink-0" title={item.rationale}>
                    {item.rationale}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Steps */}
      {executionSteps.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/80 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2 font-medium">
            <Zap className="w-3.5 h-3.5" /> Execution Pipeline
          </p>
          <div className="space-y-1.5">
            {executionSteps.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-[12px]">
                <span className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-foreground/80 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Phase */}
      {learningNotes && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 font-medium">
            <Clock className="w-3.5 h-3.5" /> Learning Phase
          </p>
          <p className="text-[13px] text-foreground/85 leading-relaxed">{learningNotes}</p>
        </div>
      )}

      {/* Guardrails */}
      {guardrails.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/80 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2 font-medium">
            <Shield className="w-3.5 h-3.5" /> Guardrails
          </p>
          <div className="space-y-2">
            {guardrails.map((note: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 text-[13px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-foreground/75 leading-relaxed">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flags & Notes */}
      {flags.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/80 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2 font-medium">
            <Info className="w-3.5 h-3.5" /> Flags & Notes
          </p>
          <div className="space-y-1.5">
            {flags.map((flag: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-[12px]">
                <span className="shrink-0 mt-0.5">{flag.startsWith('✅') ? '✅' : flag.startsWith('⚠️') ? '⚠️' : 'ℹ️'}</span>
                <span className="text-foreground/75 leading-relaxed">{flag.replace(/^[✅⚠️ℹ️]\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          size="sm"
          className="text-sm h-10 gap-2 flex-1"
          onClick={() => onArtifactAction?.(artifact.id, 'approve-strategy-plan')}
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve & Execute
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-sm h-10 gap-2"
          onClick={() => onArtifactAction?.(artifact.id, 'tweak-strategy-plan')}
        >
          <Edit3 className="w-4 h-4" />
          Tweak
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm h-10 gap-2"
          onClick={() => onArtifactAction?.(artifact.id, 'rethink-strategy-plan')}
        >
          <RefreshCw className="w-4 h-4" />
          Rethink
        </Button>
      </div>
    </div>
  );
};
