import { Artifact } from '@/types/workspace';
import { ArtifactRenderer } from './ArtifactRenderer';

interface ArtifactStreamProps {
  artifacts: Artifact[];
  onToggleCollapse: (id: string) => void;
  onEdit?: (id: string) => void;
  focusedArtifactId?: string | null;
}

export const ArtifactStream = ({ artifacts, onToggleCollapse, onEdit, focusedArtifactId }: ArtifactStreamProps) => {
  if (artifacts.length === 0) return null;

  return (
    <div className="space-y-3">
      {artifacts.map(artifact => (
        <div
          key={artifact.id}
          id={`artifact-${artifact.id}`}
          className={focusedArtifactId === artifact.id ? 'ring-2 ring-primary/30 rounded-xl' : ''}
        >
          <ArtifactRenderer
            artifact={artifact}
            onToggleCollapse={onToggleCollapse}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
};
