import { Loader2, Video, Image, Sparkles } from 'lucide-react';

export const CreativeGenerationPanel = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center animate-bounce">
          <Video className="w-4 h-4 text-accent-foreground" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center animate-bounce" style={{ animationDelay: '200ms' }}>
          <Image className="w-4 h-4 text-secondary-foreground" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-2">Generating Your Creatives</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Our Creative Agent is generating video and image ads optimized for conversion...
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Video Ad (15s)</span>
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '75%' }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Video Ad (30s)</span>
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '50%' }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Static Image Ad</span>
            <span className="text-xs text-accent">✓ Done</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Carousel Ad</span>
            <span className="text-xs text-accent">✓ Done</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        This usually takes 20-30 seconds...
      </p>
    </div>
  );
};
