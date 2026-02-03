import { useState, useRef } from 'react';
import { Upload, Check, Image as ImageIcon, User, FileText, Clock, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AVATARS, AvatarOption } from '@/data/avatars';
import { CollectedInput } from '@/types/create';

interface VideoSetupPanelProps {
  collectedInputs: CollectedInput[];
  onProvideInput: (inputId: string, value: string | File) => void;
  onStartGeneration: () => void;
}

export const VideoSetupPanel = ({ 
  collectedInputs, 
  onProvideInput,
  onStartGeneration 
}: VideoSetupPanelProps) => {
  const [description, setDescription] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState<AvatarOption | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get collected values
  const getCollectedValue = (inputId: string) => {
    const input = collectedInputs.find(i => i.inputId === inputId);
    if (!input) return undefined;
    if (typeof input.value === 'string') return input.value;
    if (input.value instanceof File) return URL.createObjectURL(input.value);
    return undefined;
  };

  const uploadedImageUrl = getCollectedValue('product-image');
  const selectedAvatarId = getCollectedValue('avatar');
  const productDescription = getCollectedValue('product-description');
  const selectedAvatar = AVATARS.find(a => a.id === selectedAvatarId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onProvideInput('product-image', file);
    }
  };

  const handleDescriptionSubmit = () => {
    if (description.trim()) {
      onProvideInput('product-description', description);
    }
  };

  // Check if ready to generate
  const hasRequiredInputs = uploadedImageUrl && productDescription;

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">Avatar Video Setup</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to create your AI video
        </p>
      </div>

      {/* Input Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        
        {/* Product Image Card */}
        <div className={cn(
          "rounded-2xl border-2 p-5 transition-all duration-200",
          uploadedImageUrl 
            ? "border-primary bg-primary/5" 
            : "border-dashed border-border hover:border-primary/50 hover:bg-muted/30"
        )}>
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              uploadedImageUrl ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {uploadedImageUrl ? <Check className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">Product Image</h3>
              <p className="text-xs text-muted-foreground">Required</p>
            </div>
          </div>

          {uploadedImageUrl ? (
            <div className="space-y-3">
              <div className="aspect-square w-full max-w-[200px] mx-auto rounded-xl overflow-hidden border border-border">
                <img src={uploadedImageUrl} alt="Product" className="w-full h-full object-cover" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                Change Image
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Upload Image</span>
              <span className="text-xs text-muted-foreground">PNG, JPG, WEBP</span>
            </button>
          )}
        </div>

        {/* Product Description Card */}
        <div className={cn(
          "rounded-2xl border-2 p-5 transition-all duration-200",
          productDescription 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50"
        )}>
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              productDescription ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {productDescription ? <Check className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">Product Description</h3>
              <p className="text-xs text-muted-foreground">Required</p>
            </div>
          </div>

          {productDescription ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg line-clamp-4">
                {productDescription}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onProvideInput('product-description', '')}
                className="w-full"
              >
                Edit Description
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product - what makes it special?"
                className="min-h-[100px] resize-none text-sm"
              />
              <Button
                size="sm"
                onClick={handleDescriptionSubmit}
                disabled={!description.trim()}
                className="w-full"
              >
                Save Description
              </Button>
            </div>
          )}
        </div>

        {/* Avatar Selection Card - Full width */}
        <div className={cn(
          "rounded-2xl border-2 p-5 transition-all duration-200 lg:col-span-2",
          selectedAvatarId 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50"
        )}>
          <div className="flex items-start gap-3 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              selectedAvatarId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {selectedAvatarId ? <Check className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">AI Presenter</h3>
              <p className="text-xs text-muted-foreground">Optional - we'll pick the best match if skipped</p>
            </div>
            {selectedAvatar && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
                <img src={selectedAvatar.imageUrl} alt={selectedAvatar.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-sm font-medium text-primary">{selectedAvatar.name}</span>
              </div>
            )}
          </div>

          {/* Avatar Grid - Horizontal scroll on mobile, grid on desktop */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => onProvideInput('avatar', avatar.id)}
                className={cn(
                  "group relative rounded-xl overflow-hidden aspect-[3/4] transition-all duration-200",
                  "hover:scale-105 hover:shadow-lg",
                  selectedAvatarId === avatar.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                <img
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Play preview button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewAvatar(avatar); }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="w-3 h-3 text-foreground fill-foreground ml-0.5" />
                </button>

                {/* Selected check */}
                {selectedAvatarId === avatar.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}

                <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-white text-center truncate">
                  {avatar.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-6 pt-4 border-t border-border">
        <Button
          size="lg"
          onClick={onStartGeneration}
          disabled={!hasRequiredInputs}
          className="w-full gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {hasRequiredInputs ? 'Generate Video' : 'Complete required fields to generate'}
        </Button>
        {!hasRequiredInputs && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Upload a product image and add a description to continue
          </p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Avatar Preview Dialog */}
      <Dialog open={!!previewAvatar} onOpenChange={() => setPreviewAvatar(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden bg-black border-none">
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
                <h3 className="text-white font-semibold">{previewAvatar.name}</h3>
                <p className="text-white/70 text-sm">{previewAvatar.style}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
