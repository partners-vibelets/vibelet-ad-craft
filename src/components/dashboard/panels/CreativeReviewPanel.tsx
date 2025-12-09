import { useState } from 'react';
import { CreativeOption } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Play, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreativeReviewPanelProps {
  creatives: CreativeOption[];
  selectedCreative: CreativeOption | null;
  onSelect: (creative: CreativeOption) => void;
}

export const CreativeReviewPanel = ({ creatives, selectedCreative: initial, onSelect }: CreativeReviewPanelProps) => {
  const [selected, setSelected] = useState<CreativeOption | null>(initial);

  const handleContinue = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Review Your Creatives</h2>
        <p className="text-sm text-muted-foreground">Select a creative for your campaign</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {creatives.map((creative) => (
          <Card 
            key={creative.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50 overflow-hidden",
              selected?.id === creative.id && "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => setSelected(creative)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted">
                <img 
                  src={creative.thumbnail} 
                  alt={creative.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  {creative.type === 'video' ? (
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-foreground ml-1" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Image className="w-5 h-5 text-foreground" />
                    </div>
                  )}
                </div>
                {selected?.id === creative.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-xs">
                  {creative.type === 'video' ? 'Video' : 'Image'}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-foreground text-sm">{creative.name}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
        <p className="text-sm text-foreground">
          <span className="font-medium">💡 Recommendation:</span> Video ads typically get 30% higher engagement than static images.
        </p>
      </div>

      <Button 
        className="w-full" 
        disabled={!selected}
        onClick={handleContinue}
      >
        Continue with {selected?.name || 'Selected Creative'}
      </Button>
    </div>
  );
};
