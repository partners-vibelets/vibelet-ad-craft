import { useState } from 'react';
import { Download, RefreshCw, Wand2, ArrowRight, Check, Play, Pause } from 'lucide-react';
import { GeneratedCreative } from '@/types/create';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';

interface CreativeResultProps {
  outputs: GeneratedCreative[];
  onRegenerate: () => void;
  onUseCampaign?: () => void;
}

export const CreativeResult = ({ outputs, onRegenerate, onUseCampaign }: CreativeResultProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const selectedOutput = outputs[selectedIndex];
  const isVideo = selectedOutput?.type === 'video';

  const handleDownload = () => {
    if (!selectedOutput) return;
    
    // In production, this would trigger actual download
    toast({
      title: "Download started",
      description: `Your ${isVideo ? 'video' : 'image'} is being downloaded.`,
    });
  };

  const handleUseCampaign = () => {
    if (onUseCampaign) {
      onUseCampaign();
    } else {
      toast({
        title: "Use in Campaign",
        description: "This creative will be added to your campaign.",
      });
    }
  };

  if (outputs.length === 0) return null;

  return (
    <div className="flex flex-col h-full p-6">
      {/* Main preview */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="relative w-full max-w-lg">
          <div className={cn(
            "rounded-2xl overflow-hidden",
            "bg-muted border border-border",
            "shadow-lg"
          )}>
            <AspectRatio ratio={1}>
              {isVideo ? (
                <div className="relative w-full h-full bg-black">
                  <video
                    src={selectedOutput.url}
                    poster={selectedOutput.thumbnailUrl}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    autoPlay={isPlaying}
                  />
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center",
                      "bg-black/20 hover:bg-black/30 transition-colors"
                    )}
                  >
                    {isPlaying ? (
                      <Pause className="w-12 h-12 text-white drop-shadow-lg" />
                    ) : (
                      <Play className="w-12 h-12 text-white drop-shadow-lg" />
                    )}
                  </button>
                </div>
              ) : (
                <img
                  src={selectedOutput.url}
                  alt="Generated creative"
                  className="w-full h-full object-cover"
                />
              )}
            </AspectRatio>
          </div>

          {/* Selected indicator */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Variations */}
      {outputs.length > 1 && (
        <div className="flex justify-center gap-3 mb-6">
          {outputs.map((output, index) => (
            <button
              key={output.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative w-20 h-20 rounded-xl overflow-hidden",
                "border-2 transition-all duration-200",
                index === selectedIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <img
                src={output.thumbnailUrl || output.url}
                alt={`Variation ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === selectedIndex && (
                <div className="absolute inset-0 bg-primary/10" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button
          variant="outline"
          onClick={onRegenerate}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </Button>
        <Button
          variant="outline"
          className="gap-2"
        >
          <Wand2 className="w-4 h-4" />
          Edit Prompt
        </Button>
        <Button
          onClick={handleUseCampaign}
          className="gap-2"
        >
          Use in Campaign
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Metadata */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          {selectedOutput.width}×{selectedOutput.height} • {selectedOutput.format.toUpperCase()}
          {selectedOutput.duration && ` • ${selectedOutput.duration}s`}
        </p>
      </div>
    </div>
  );
};
