import { ScriptOption } from '@/types/campaign';
import { scriptOptions } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScriptSelectionPanelProps {
  selectedScript: ScriptOption | null;
  onSelect: (script: ScriptOption) => void;
}

export const ScriptSelectionPanel = ({ selectedScript, onSelect }: ScriptSelectionPanelProps) => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Choose Your Script Style</h2>
        <p className="text-sm text-muted-foreground">Select a creative approach for your video ad</p>
      </div>

      <div className="space-y-3">
        {scriptOptions.map((script) => (
          <Card 
            key={script.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selectedScript?.id === script.id && "border-primary bg-primary/5"
            )}
            onClick={() => onSelect(script)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{script.name}</h3>
                    {selectedScript?.id === script.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{script.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {script.duration}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Sparkles className="w-3 h-3" />
                      {script.style}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        className="w-full" 
        disabled={!selectedScript}
        onClick={() => selectedScript && onSelect(selectedScript)}
      >
        Continue with {selectedScript?.name || 'Selected Script'}
      </Button>
    </div>
  );
};
