import { CreativeOption } from '@/types/campaign';
import { Image, Video, Check, Play, RefreshCw, Smartphone, Monitor, Square, RectangleVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageMagnifier } from '@/components/ui/image-magnifier';
import { Badge } from '@/components/ui/badge';

interface CreativeGalleryPanelProps {
  creatives: CreativeOption[];
  selectedCreative: CreativeOption | null;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
}

const getAspectRatioClass = (aspectRatio?: string) => {
  switch (aspectRatio) {
    case '9:16':
      return 'aspect-[9/16]';
    case '4:5':
      return 'aspect-[4/5]';
    case '1.91:1':
      return 'aspect-[1.91/1]';
    case '1:1':
    default:
      return 'aspect-square';
  }
};

const getFormatIcon = (format?: string) => {
  switch (format) {
    case 'reel':
    case 'story':
      return <Smartphone className="w-3 h-3" />;
    case 'landscape':
      return <Monitor className="w-3 h-3" />;
    case 'feed':
    default:
      return <Square className="w-3 h-3" />;
  }
};

const getFormatLabel = (format?: string) => {
  switch (format) {
    case 'reel':
      return 'Reel/Story';
    case 'story':
      return 'Story';
    case 'landscape':
      return 'Landscape';
    case 'feed':
    default:
      return 'Feed';
  }
};

export const CreativeGalleryPanel = ({ creatives, selectedCreative, isRegenerating, onRegenerate }: CreativeGalleryPanelProps) => {
  // Group creatives by aspect ratio for better organization
  const verticalCreatives = creatives.filter(c => c.aspectRatio === '9:16' || c.aspectRatio === '4:5');
  const horizontalCreatives = creatives.filter(c => c.aspectRatio === '1.91:1' || c.aspectRatio === '1:1' || !c.aspectRatio);

  const renderCreativeCard = (creative: CreativeOption) => {
    const isSelected = selectedCreative?.id === creative.id;
    const isVideo = creative.type === 'video';
    const isVertical = creative.aspectRatio === '9:16' || creative.aspectRatio === '4:5';
    
    return (
      <div
        key={creative.id}
        className={cn(
          "group relative rounded-xl border overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5",
          isSelected 
            ? "border-primary ring-2 ring-primary shadow-lg shadow-primary/20"
            : "border-border hover:border-primary/50"
        )}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        )}
        
        {/* Format badge */}
        <div className="absolute top-2 left-2 z-20">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-[10px] px-1.5 py-0.5 gap-1 backdrop-blur-sm",
              "bg-background/80 border border-border/50"
            )}
          >
            {getFormatIcon(creative.format)}
            {creative.aspectRatio}
          </Badge>
        </div>
        
        {/* Creative image with proper aspect ratio */}
        <div className={cn(
          "relative overflow-hidden bg-muted",
          getAspectRatioClass(creative.aspectRatio),
          isVertical ? "max-h-[200px]" : "max-h-[160px]"
        )}>
          <ImageMagnifier 
            src={creative.thumbnail} 
            alt={creative.name}
            zoomLevel={2.5}
            magnifierSize={isVertical ? 80 : 100}
            className="w-full h-full"
            imageClassName="w-full h-full object-cover"
          />
          
          {/* Video play overlay */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/20 pointer-events-none">
              <div className={cn(
                "rounded-full bg-background/90 flex items-center justify-center shadow-lg",
                "transition-transform group-hover:scale-110",
                isVertical ? "w-10 h-10" : "w-12 h-12"
              )}>
                <Play className={cn(
                  "text-foreground ml-0.5",
                  isVertical ? "w-4 h-4" : "w-5 h-5"
                )} fill="currentColor" />
              </div>
            </div>
          )}
        </div>
        
        {/* Creative info */}
        <div className="p-2.5 bg-card/80 backdrop-blur-sm border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1 rounded-md",
              isVideo ? "bg-primary/10" : "bg-secondary/10"
            )}>
              {isVideo ? (
                <Video className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Image className="w-3.5 h-3.5 text-secondary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-medium truncate",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {creative.name}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                {getFormatIcon(creative.format)}
                {getFormatLabel(creative.format)}
              </p>
            </div>
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
          AI-generated ads optimized for Facebook placements
        </p>
      </div>

      <div className={cn("space-y-6", isRegenerating && "opacity-50 pointer-events-none")}>
        {/* Vertical formats (Reels/Stories) */}
        {verticalCreatives.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RectangleVertical className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Stories & Reels</h3>
              <span className="text-xs text-muted-foreground">(9:16, 4:5)</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {verticalCreatives.map(renderCreativeCard)}
            </div>
          </div>
        )}

        {/* Horizontal/Square formats (Feed/Landscape) */}
        {horizontalCreatives.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Feed & Display</h3>
              <span className="text-xs text-muted-foreground">(1:1, 1.91:1)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {horizontalCreatives.map(renderCreativeCard)}
            </div>
          </div>
        )}
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
