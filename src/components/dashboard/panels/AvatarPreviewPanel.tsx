import { useState, useRef } from 'react';
import { AvatarOption } from '@/types/campaign';
import { User, Check, Play, Pause, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AvatarPreviewPanelProps {
  avatars: AvatarOption[];
  selectedAvatar: AvatarOption | null;
}

export const AvatarPreviewPanel = ({ avatars, selectedAvatar }: AvatarPreviewPanelProps) => {
  const [previewAvatar, setPreviewAvatar] = useState<AvatarOption | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePreview = (avatar: AvatarOption) => {
    setPreviewAvatar(avatar);
    setIsPlaying(true);
  };

  const handleClosePreview = () => {
    setPreviewAvatar(null);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <User className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">AI Video Presenters</h2>
        <p className="text-sm text-muted-foreground">
          Click preview to see how each avatar speaks
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {avatars.map((avatar) => {
          const isSelected = selectedAvatar?.id === avatar.id;
          return (
            <div
              key={avatar.id}
              className={cn(
                "relative p-3 rounded-xl border transition-all group",
                isSelected 
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  <div className={cn(
                    "w-24 h-24 rounded-full overflow-hidden border-2",
                    isSelected ? "border-primary" : "border-border"
                  )}>
                    <img 
                      src={avatar.image} 
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {avatar.videoPreview && (
                    <button
                      onClick={() => handlePreview(avatar)}
                      className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                      </div>
                    </button>
                  )}
                </div>
                <div>
                  <h3 className={cn(
                    "font-medium text-sm",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {avatar.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {avatar.style}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Preview Dialog */}
      <Dialog open={!!previewAvatar} onOpenChange={() => handleClosePreview()}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background border-border">
          {previewAvatar && (
            <div className="relative">
              <button
                onClick={handleClosePreview}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
              
              <div className="aspect-video bg-muted relative">
                <video
                  ref={videoRef}
                  src={previewAvatar.videoPreview}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-foreground" />
                    ) : (
                      <Play className="w-8 h-8 text-foreground ml-1" />
                    )}
                  </div>
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                    <img 
                      src={previewAvatar.image} 
                      alt={previewAvatar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{previewAvatar.name}</h3>
                    <p className="text-sm text-muted-foreground">{previewAvatar.style}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Preview how this AI presenter delivers your product message. 
                  Select this avatar in the chat to use them for your ad.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
