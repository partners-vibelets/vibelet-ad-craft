import { useState, useRef, useCallback } from 'react';
import { Upload, Image, Video, Check, AlertCircle, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Facebook Ad Creative Guidelines
const CREATIVE_SPECS = {
  image: {
    formats: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 30 * 1024 * 1024, // 30MB
    aspectRatios: [
      { name: '1:1 (Square)', ratio: 1, dimensions: '1080 x 1080', recommended: true },
      { name: '4:5 (Vertical)', ratio: 0.8, dimensions: '1080 x 1350', recommended: true },
      { name: '9:16 (Stories/Reels)', ratio: 0.5625, dimensions: '1080 x 1920', recommended: false },
      { name: '1.91:1 (Landscape)', ratio: 1.91, dimensions: '1200 x 628', recommended: false }
    ],
    minDimension: 600,
    maxDimension: 8192
  },
  video: {
    formats: ['video/mp4', 'video/mov', 'video/quicktime'],
    maxSize: 4 * 1024 * 1024 * 1024, // 4GB
    maxDuration: 240 * 60, // 240 minutes in seconds
    recommendedDuration: { min: 15, max: 60 },
    aspectRatios: [
      { name: '1:1 (Square)', ratio: 1, dimensions: '1080 x 1080', recommended: true },
      { name: '4:5 (Vertical)', ratio: 0.8, dimensions: '1080 x 1350', recommended: true },
      { name: '9:16 (Stories/Reels)', ratio: 0.5625, dimensions: '1080 x 1920', recommended: true },
      { name: '16:9 (Landscape)', ratio: 1.78, dimensions: '1920 x 1080', recommended: false }
    ]
  }
};

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  dimensions?: { width: number; height: number };
  duration?: number;
  aspectRatio?: string;
  isValid: boolean;
  errors: string[];
}

interface CustomCreativeUploadProps {
  onSubmit: (creative: { type: 'image' | 'video'; file: File; preview: string; name: string }) => void;
  onCancel: () => void;
}

export const CustomCreativeUpload = ({ onSubmit, onCancel }: CustomCreativeUploadProps) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const errors: string[] = [];
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const type = isImage ? 'image' : 'video';
    const specs = isImage ? CREATIVE_SPECS.image : CREATIVE_SPECS.video;

    // Check format
    if (!specs.formats.includes(file.type)) {
      errors.push(`Unsupported format. Use: ${specs.formats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`);
    }

    // Check file size
    if (file.size > specs.maxSize) {
      const maxMB = specs.maxSize / (1024 * 1024);
      errors.push(`File too large. Max: ${maxMB >= 1024 ? `${maxMB / 1024}GB` : `${maxMB}MB`}`);
    }

    // Create preview
    const preview = URL.createObjectURL(file);

    // Get dimensions and duration
    let dimensions: { width: number; height: number } | undefined;
    let duration: number | undefined;
    let aspectRatio: string | undefined;

    if (isImage) {
      dimensions = await getImageDimensions(preview);
      if (dimensions) {
        const ratio = dimensions.width / dimensions.height;
        aspectRatio = getClosestAspectRatio(ratio, CREATIVE_SPECS.image.aspectRatios);
        
        if (dimensions.width < CREATIVE_SPECS.image.minDimension || dimensions.height < CREATIVE_SPECS.image.minDimension) {
          errors.push(`Image too small. Min dimension: ${CREATIVE_SPECS.image.minDimension}px`);
        }
      }
    } else if (isVideo) {
      const videoInfo = await getVideoDimensions(preview);
      if (videoInfo) {
        dimensions = { width: videoInfo.width, height: videoInfo.height };
        duration = videoInfo.duration;
        const ratio = videoInfo.width / videoInfo.height;
        aspectRatio = getClosestAspectRatio(ratio, CREATIVE_SPECS.video.aspectRatios);
        
        if (duration > CREATIVE_SPECS.video.maxDuration) {
          errors.push(`Video too long. Max: ${CREATIVE_SPECS.video.maxDuration / 60} minutes`);
        }
      }
    }

    return {
      file,
      preview,
      type: type as 'image' | 'video',
      dimensions,
      duration,
      aspectRatio,
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = src;
    });
  };

  const getVideoDimensions = (src: string): Promise<{ width: number; height: number; duration: number }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration });
      };
      video.onerror = () => resolve({ width: 0, height: 0, duration: 0 });
      video.src = src;
    });
  };

  const getClosestAspectRatio = (ratio: number, ratios: typeof CREATIVE_SPECS.image.aspectRatios): string => {
    let closest = ratios[0];
    let minDiff = Math.abs(ratio - ratios[0].ratio);
    
    for (const r of ratios) {
      const diff = Math.abs(ratio - r.ratio);
      if (diff < minDiff) {
        minDiff = diff;
        closest = r;
      }
    }
    return closest.name;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validated = await validateFile(file);
    setUploadedFile(validated);
    
    // Switch tab based on file type
    if (validated.type !== activeTab) {
      setActiveTab(validated.type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    if (uploadedFile && uploadedFile.isValid) {
      onSubmit({
        type: uploadedFile.type,
        file: uploadedFile.file,
        preview: uploadedFile.preview,
        name: `Custom ${uploadedFile.type === 'video' ? 'Video' : 'Image'} Ad`
      });
    }
  };

  const clearUpload = () => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
  };

  const specs = activeTab === 'image' ? CREATIVE_SPECS.image : CREATIVE_SPECS.video;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Upload Your Creative</h2>
        <p className="text-sm text-muted-foreground">
          Upload your own image or video following Facebook guidelines
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'video')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Image
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {/* Upload Zone */}
          {!uploadedFile ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-3">
                {activeTab === 'image' ? (
                  <Image className="w-7 h-7 text-muted-foreground" />
                ) : (
                  <Video className="w-7 h-7 text-muted-foreground" />
                )}
              </div>
              <p className="text-foreground font-medium">
                Drop your {activeTab} here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === 'image' ? 'JPG, PNG, or WebP' : 'MP4 or MOV'}
              </p>
              
              {/* Compact specs inline */}
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1.5 cursor-help">
                      <Check className="w-3 h-3 text-secondary" />
                      1:1, 4:5{activeTab === 'video' ? ', 9:16' : ''}
                      <Info className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium mb-1">Recommended Aspect Ratios</p>
                    <ul className="space-y-0.5">
                      {specs.aspectRatios.filter(r => r.recommended).map((ratio) => (
                        <li key={ratio.name}>{ratio.name} ({ratio.dimensions})</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
                <span className="text-border">•</span>
                <span>Max {specs.maxSize >= 1024 * 1024 * 1024 
                  ? `${specs.maxSize / (1024 * 1024 * 1024)}GB` 
                  : `${specs.maxSize / (1024 * 1024)}MB`}
                </span>
                {activeTab === 'video' && (
                  <>
                    <span className="text-border">•</span>
                    <span>15-60s recommended</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Preview */
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-border">
                <button
                  onClick={clearUpload}
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {uploadedFile.type === 'image' ? (
                  <img 
                    src={uploadedFile.preview} 
                    alt="Preview" 
                    className="w-full max-h-[300px] object-contain bg-muted"
                  />
                ) : (
                  <video 
                    src={uploadedFile.preview} 
                    controls 
                    className="w-full max-h-[300px] object-contain bg-muted"
                  />
                )}
              </div>

              {/* File Info */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {uploadedFile.file.name}
                  </span>
                  {uploadedFile.isValid ? (
                    <span className="text-xs text-secondary flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Valid
                    </span>
                  ) : (
                    <span className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Issues found
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {uploadedFile.dimensions && (
                    <span>Size: {uploadedFile.dimensions.width} × {uploadedFile.dimensions.height}</span>
                  )}
                  {uploadedFile.aspectRatio && (
                    <span>Ratio: {uploadedFile.aspectRatio}</span>
                  )}
                  {uploadedFile.duration !== undefined && (
                    <span>Duration: {Math.round(uploadedFile.duration)}s</span>
                  )}
                  <span>File: {(uploadedFile.file.size / (1024 * 1024)).toFixed(1)}MB</span>
                </div>

                {uploadedFile.errors.length > 0 && (
                  <div className="pt-2 border-t border-border space-y-1">
                    {uploadedFile.errors.map((error, i) => (
                      <p key={i} className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Back to AI Creatives
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!uploadedFile?.isValid}
          className="flex-1 bg-secondary hover:bg-secondary/90"
        >
          <Check className="w-4 h-4 mr-2" />
          Use This Creative
        </Button>
      </div>
    </div>
  );
};
