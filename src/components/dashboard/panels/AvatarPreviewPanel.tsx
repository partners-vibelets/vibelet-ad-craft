import { AvatarOption } from '@/types/campaign';
import { User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarPreviewPanelProps {
  avatars: AvatarOption[];
  selectedAvatar: AvatarOption | null;
}

export const AvatarPreviewPanel = ({ avatars, selectedAvatar }: AvatarPreviewPanelProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <User className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">AI Presenters</h2>
        <p className="text-sm text-muted-foreground">
          Select an avatar to present your product
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {avatars.map((avatar) => {
          const isSelected = selectedAvatar?.id === avatar.id;
          return (
            <div
              key={avatar.id}
              className={cn(
                "relative p-4 rounded-xl border transition-all",
                isSelected 
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={cn(
                  "w-20 h-20 rounded-full overflow-hidden border-2",
                  isSelected ? "border-primary" : "border-border"
                )}>
                  <img 
                    src={avatar.image} 
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className={cn(
                    "font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {avatar.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {avatar.style}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
