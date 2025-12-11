import { CreativeOption } from '@/types/campaign';
import { Image, Video, Check, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { VideoThumbnailPlaceholder } from './VideoThumbnailPlaceholder';
interface CreativeGalleryPanelProps {
  creatives: CreativeOption[];
  selectedCreative: CreativeOption | null;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
}

const getFormatLabel = (format?: string, aspectRatio?: string) => {
  if (aspectRatio === '9:16') return 'Reel/Story';
  if (aspectRatio === '4:5') return 'Feed Vertical';
  if (aspectRatio === '1.91:1') return 'Landscape';
  if (aspectRatio === '1:1') return 'Square';
  return format || 'Feed';
};

export const CreativeGalleryPanel = ({ creatives, selectedCreative, isRegenerating, onRegenerate }: CreativeGalleryPanelProps) => {
  const renderCreativeCard = (creative: CreativeOption) => {
    const isSelected = selectedCreative?.id === creative.id;
    const isVideo = creative.type === 'video';
    
    return (
      <div
        key={creative.id}
        className={cn(
          "group relative rounded-xl overflow-hidden transition-all duration-300",
          "border-2 bg-card",
          "hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-1",
          isSelected 
            ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20"
            : "border-border/60 hover:border-primary/40"
        )}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        )}
        
        {/* Format & Type badge */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-[10px] px-2 py-0.5 gap-1 font-medium",
              "bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm"
            )}
          >
            {isVideo ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
            {creative.aspectRatio || '1:1'}
          </Badge>
        </div>
        
        {/* Creative image - consistent square container with object-cover */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {isVideo ? (
            <VideoThumbnailPlaceholder aspectRatio={creative.aspectRatio} />
          ) : (
            <img 
              src={creative.thumbnail} 
              alt={creative.name}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Video play overlay - only for images that have thumbnails */}
          {isVideo && creative.thumbnail && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
              <div className={cn(
                "w-12 h-12 rounded-full bg-background/95 flex items-center justify-center shadow-xl",
                "transition-all duration-300 group-hover:scale-110 group-hover:bg-primary",
                "border border-border/50"
              )}>
                <Play className="w-5 h-5 text-foreground group-hover:text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
          
          {/* Creative info - overlaid on image */}
          <div className="absolute inset-x-0 bottom-0 p-3 z-10">
            <p className="text-sm font-semibold text-white truncate drop-shadow-md">
              {creative.name}
            </p>
            <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
              {getFormatLabel(creative.format, creative.aspectRatio)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <Image className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Generated Creatives</h2>
        <p className="text-sm text-muted-foreground">
          AI-generated ads optimized for Facebook
        </p>
      </div>

      {/* Creatives Grid - uniform 2x2 layout */}
      <div className={cn(
        "grid grid-cols-2 gap-4",
        isRegenerating && "opacity-50 pointer-events-none"
      )}>
        {creatives.map(renderCreativeCard)}
      </div>

      {/* Regenerate option */}
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
