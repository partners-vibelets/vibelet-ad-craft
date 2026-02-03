import { Loader2, Sparkles } from 'lucide-react';
import { CreateTemplate } from '@/types/create';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface GenerationPreviewProps {
  template: CreateTemplate | null;
}

export const GenerationPreview = ({ template }: GenerationPreviewProps) => {
  const isVideo = template?.outputType === 'video';

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="relative w-full max-w-lg">
        {/* Main preview skeleton */}
        <div className={cn(
          "relative rounded-2xl overflow-hidden",
          "bg-gradient-to-br from-muted/50 to-muted",
          "border border-border"
        )}>
          <div className="aspect-square">
            {/* Shimmer effect */}
            <div className="absolute inset-0 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
            </div>
            
            {/* Center loading indicator */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="w-12 h-12 text-primary/30" />
                </div>
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {isVideo ? 'Generating your video...' : 'Creating your image...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Variation skeletons */}
        <div className="flex gap-3 mt-4 justify-center">
          {[1, 2].map((i) => (
            <Skeleton 
              key={i} 
              className="w-20 h-20 rounded-xl" 
            />
          ))}
        </div>

        {/* Progress hint */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            {isVideo 
              ? 'This may take up to 2 minutes for video generation'
              : 'Usually takes about 30 seconds'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
