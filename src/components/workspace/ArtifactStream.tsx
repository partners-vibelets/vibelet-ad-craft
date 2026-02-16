import { Artifact } from '@/types/workspace';
import { ArtifactRenderer } from './ArtifactRenderer';

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
      {artifacts.map(artifact => (
        <div
          key={artifact.id}
          id={`artifact-${artifact.id}`}
          className={focusedArtifactId === artifact.id ? 'ring-2 ring-primary/20 rounded-xl transition-all' : 'transition-all'}
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
