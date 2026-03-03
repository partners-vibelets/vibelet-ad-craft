import { Lightbulb, Clock, Shield, AlertTriangle, CheckCircle2, Edit3, RefreshCw } from 'lucide-react';
import { Artifact } from '@/types/workspace';
import { Button } from '@/components/ui/button';

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

  const hasContent = rationale || learningNotes || guardrails.length > 0;
  if (!hasContent) return null;

  return (
    <div className="space-y-3 pl-9 animate-fade-in">
      {/* Rationale */}
      {rationale && (
        <div className="rounded-xl border border-border/40 bg-card/80 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 font-medium">
            <Lightbulb className="w-3.5 h-3.5" /> Rationale
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">{rationale}</p>
        </div>
      )}

      {/* Learning Phase */}
      {learningNotes && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 font-medium">
            <Clock className="w-3.5 h-3.5" /> Learning Phase
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">{learningNotes}</p>
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
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-foreground/75 leading-relaxed">{note}</span>
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
