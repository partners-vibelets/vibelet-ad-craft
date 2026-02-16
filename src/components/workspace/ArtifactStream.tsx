import { Artifact } from '@/types/workspace';
import { ArtifactRenderer } from './ArtifactRenderer';
import { cn } from '@/lib/utils';

interface ArtifactStreamProps {
  artifacts: Artifact[];
  onToggleCollapse: (id: string) => void;
  onUpdateData: (id: string, data: Record<string, any>) => void;
  onArtifactAction?: (artifactId: string, action: string, payload?: any) => void;
  focusedArtifactId?: string | null;
}

export const ArtifactStream = ({ artifacts, onToggleCollapse, onUpdateData, onArtifactAction, focusedArtifactId }: ArtifactStreamProps) => {
  if (artifacts.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {artifacts.map((artifact, idx) => (
        <div
          key={artifact.id}
          id={`artifact-${artifact.id}`}
          className={cn(
            'animate-fade-in transition-all duration-300',
            focusedArtifactId === artifact.id && 'ring-2 ring-primary/20 rounded-xl'
          )}
          style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'backwards' }}
        >
          <ArtifactRenderer
            artifact={artifact}
            onToggleCollapse={onToggleCollapse}
            onUpdateData={onUpdateData}
            onArtifactAction={onArtifactAction}
          />
        </div>
      ))}
    </div>
  );
};
