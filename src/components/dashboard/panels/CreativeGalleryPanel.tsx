import { CreativeOption } from '@/types/campaign';
import { Image, Video, Check, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CreativeGalleryPanelProps {
  creatives: CreativeOption[];
  selectedCreative: CreativeOption | null;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
}

export const CreativeGalleryPanel = ({ creatives, selectedCreative, isRegenerating, onRegenerate }: CreativeGalleryPanelProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <Image className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Generated Creatives</h2>
        <p className="text-sm text-muted-foreground">
          AI-generated ads for your product
        </p>
      </div>

      <div className={cn("grid grid-cols-2 gap-4", isRegenerating && "opacity-50 pointer-events-none")}>
        {creatives.map((creative) => {
          const isSelected = selectedCreative?.id === creative.id;
          const isVideo = creative.type === 'video';
          
          return (
            <div
              key={creative.id}
              className={cn(
                "relative rounded-xl border overflow-hidden transition-all",
                isSelected 
                  ? "border-primary ring-2 ring-primary"
                  : "border-border"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              
              <div className="aspect-square relative">
                <img 
                  src={creative.thumbnail} 
                  alt={creative.name}
                  className="w-full h-full object-cover"
                />
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center">
                      <Play className="w-5 h-5 text-foreground ml-1" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-card">
                <div className="flex items-center gap-2">
                  {isVideo ? (
                    <Video className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Image className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={cn(
                    "text-sm font-medium truncate",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {creative.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Regenerate option - subtle placement below creatives */}
      {onRegenerate && !selectedCreative && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("w-3 h-3 mr-1.5", isRegenerating && "animate-spin")} />
            {isRegenerating ? 'Generating new creatives...' : 'Generate different creatives'}
          </Button>
        </div>
      )}
    </div>
  );
};
