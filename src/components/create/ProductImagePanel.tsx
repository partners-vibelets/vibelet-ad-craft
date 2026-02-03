import { useState, useRef } from 'react';
import { Upload, ImageIcon, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductImagePanelProps {
  onUpload: (file: File) => void;
  uploadedImageUrl?: string;
}

export const ProductImagePanel = ({ onUpload, uploadedImageUrl }: ProductImagePanelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(uploadedImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Upload Your Product Image
          </h2>
          <p className="text-sm text-muted-foreground">
            This will be featured in your AI-generated video
          </p>
        </div>

        {previewUrl ? (
          // Image preview
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary bg-muted">
              <img
                src={previewUrl}
                alt="Product preview"
                className="w-full h-full object-contain"
              />
              
              {/* Success indicator */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Check className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4 justify-center">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Change Image
              </Button>
              <Button
                variant="ghost"
                onClick={clearImage}
                className="gap-2 text-muted-foreground"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              ✓ Image uploaded successfully. Continue in chat to proceed.
            </p>
          </div>
        ) : (
          // Upload dropzone
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative aspect-square rounded-2xl border-2 border-dashed cursor-pointer",
              "flex flex-col items-center justify-center",
              "transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}>
              <ImageIcon className={cn(
                "w-10 h-10",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>

            <p className="text-lg font-medium text-foreground mb-1">
              {isDragging ? 'Drop your image here' : 'Drop your product image here'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>

            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded bg-muted">PNG</span>
              <span className="px-2 py-1 rounded bg-muted">JPG</span>
              <span className="px-2 py-1 rounded bg-muted">WEBP</span>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};
