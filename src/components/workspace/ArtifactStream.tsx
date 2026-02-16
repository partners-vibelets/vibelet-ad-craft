import { Artifact } from '@/types/workspace';
import { ArtifactRenderer } from './ArtifactRenderer';
import { cn } from '@/lib/utils';
import { Pin } from 'lucide-react';

interface ArtifactStreamProps {
  artifacts: Artifact[];
  onToggleCollapse: (id: string) => void;
  onUpdateData: (id: string, data: Record<string, any>) => void;
  onArtifactAction?: (artifactId: string, action: string, payload?: any) => void;
  focusedArtifactId?: string | null;
  pinnedIds?: string[];
  onPinArtifact?: (id: string) => void;
}

export const ArtifactStream = ({ artifacts, onToggleCollapse, onUpdateData, onArtifactAction, focusedArtifactId, pinnedIds = [], onPinArtifact }: ArtifactStreamProps) => {
  if (artifacts.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {artifacts.map((artifact, idx) => {
        const isPinned = pinnedIds.includes(artifact.id);
        return (
          <div
            key={artifact.id}
            id={`artifact-${artifact.id}`}
            className={cn(
              'animate-fade-in transition-all duration-300 group/artifact relative',
              focusedArtifactId === artifact.id && 'ring-2 ring-primary/20 rounded-xl'
            )}
            style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'backwards' }}
          >
            {/* Pin button */}
            {onPinArtifact && (
              <button
                onClick={() => onPinArtifact(artifact.id)}
                className={cn(
                  "absolute top-2 right-2 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-all",
                  isPinned
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground/40 opacity-0 group-hover/artifact:opacity-100 hover:text-foreground hover:bg-muted/50"
                )}
                title={isPinned ? 'Unpin artifact' : 'Pin to top'}
              >
                <Pin className={cn("w-3 h-3", isPinned && "fill-current")} />
              </button>
            )}
            <ArtifactRenderer
              artifact={artifact}
              onToggleCollapse={onToggleCollapse}
              onUpdateData={onUpdateData}
              onArtifactAction={onArtifactAction}
            />
          </div>
        );
      })}
    </div>
  );
};
