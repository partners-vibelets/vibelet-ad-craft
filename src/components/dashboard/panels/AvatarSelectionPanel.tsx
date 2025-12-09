import { AvatarOption } from '@/types/campaign';
import { avatarOptions } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AvatarSelectionPanelProps {
  selectedAvatar: AvatarOption | null;
  onSelect: (avatar: AvatarOption) => void;
}

export const AvatarSelectionPanel = ({ selectedAvatar: initialAvatar, onSelect }: AvatarSelectionPanelProps) => {
  const [selected, setSelected] = useState<AvatarOption | null>(initialAvatar);

  const handleContinue = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Select Your AI Avatar</h2>
        <p className="text-sm text-muted-foreground">Choose a presenter for your video ad</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {avatarOptions.map((avatar) => (
          <Card 
            key={avatar.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50 overflow-hidden",
              selected?.id === avatar.id && "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => setSelected(avatar)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <img 
                  src={avatar.image} 
                  alt={avatar.name} 
                  className="w-full h-full object-cover"
                />
                {selected?.id === avatar.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-foreground">{avatar.name}</h3>
                <p className="text-xs text-muted-foreground">{avatar.style}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Pro tip:</span> Avatars with a friendly, approachable style tend to perform better for product ads.
        </p>
      </div>

      <Button 
        className="w-full" 
        disabled={!selected}
        onClick={handleContinue}
      >
        Generate Creatives with {selected?.name || 'Avatar'}
      </Button>
    </div>
  );
};
