import { useState } from 'react';
import { Play, Check, X } from 'lucide-react';
import { AvatarOption, AVATARS } from '@/data/avatars';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AvatarSelectionPanelProps {
  onSelectAvatar: (avatarId: string) => void;
  selectedAvatarId?: string;
}

export const AvatarSelectionPanel = ({ 
  onSelectAvatar, 
  selectedAvatarId 
}: AvatarSelectionPanelProps) => {
  const [previewAvatar, setPreviewAvatar] = useState<AvatarOption | null>(null);

  const handlePlayPreview = (avatar: AvatarOption, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewAvatar(avatar);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6 shrink-0">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Choose Your AI Presenter
        </h2>
        <p className="text-sm text-muted-foreground">
          Click play to preview their style before selecting
        </p>
      </div>

      {/* Avatar Grid - 4x2 layout */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => onSelectAvatar(avatar.id)}
              className={cn(
                "group relative rounded-2xl overflow-hidden",
                "transition-all duration-300 ease-out",
                "hover:scale-[1.02] hover:shadow-xl",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                selectedAvatarId === avatar.id && "ring-2 ring-primary"
              )}
            >
              {/* Aspect ratio container for 9:16 vertical format */}
              <div className="relative aspect-[9/16]">
                {/* Avatar Image */}
                <img
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play button - visible on hover */}
                <button
                  onClick={(e) => handlePlayPreview(avatar, e)}
                  className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    "w-14 h-14 rounded-full",
                    "bg-white/90 backdrop-blur-sm",
                    "flex items-center justify-center",
                    "opacity-0 group-hover:opacity-100",
                    "transition-all duration-200",
                    "hover:bg-white hover:scale-110",
                    "shadow-lg"
                  )}
                >
                  <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
                </button>

                {/* Selected checkmark */}
                {selectedAvatarId === avatar.id && (
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}

                {/* Info overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-base">
                    {avatar.name}
                  </h3>
                  <p className="text-white/70 text-xs mt-0.5">
                    {avatar.style}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Video Preview Dialog */}
      <Dialog open={!!previewAvatar} onOpenChange={() => setPreviewAvatar(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-black border-none">
          <button
            onClick={() => setPreviewAvatar(null)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          
          {previewAvatar && (
            <div className="relative aspect-[9/16]">
              <video
                src={previewAvatar.videoPreviewUrl}
                className="w-full h-full object-cover"
                autoPlay
                loop
                playsInline
                muted
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-semibold text-lg">
                  {previewAvatar.name}
                </h3>
                <p className="text-white/70 text-sm">
                  {previewAvatar.style}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
