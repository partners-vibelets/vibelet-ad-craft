import { useState, useRef, useCallback } from 'react';
import { Upload, FolderOpen, Sparkles, Play, X, Check, Lock, Unlock, AlertTriangle, ImageIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompactAdFields } from './CompactAdFields';
import { CreativeLibraryPicker } from './CreativeLibraryPicker';
import { VideoCreativeBrief } from './VideoCreativeBrief';
import { ImageCreativeBrief } from './ImageCreativeBrief';

type CreativeSource = 'upload' | 'library' | 'ai-generate';

interface AttachedCreative {
  url: string;
  type: 'image' | 'video';
  fileName: string;
}

interface CreativeSourceTabsProps {
  ad: any;
  isVideo: boolean;
  frozenAds: Set<string>;
  onToggleFreeze: (adKey: string) => void;
  onUpdateField: (field: string, value: any) => void;
  onUpdateAdCopy: (field: string, value: string) => void;
  productImages?: string[];
}

// Mock product images for demo
const DEFAULT_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=200&h=200&fit=crop',
];

export const CreativeSourceTabs = ({
  ad, isVideo, frozenAds, onToggleFreeze, onUpdateField, onUpdateAdCopy, productImages
}: CreativeSourceTabsProps) => {
  const adKey = ad.name;
  const isFrozen = frozenAds.has(adKey);
  const [activeTab, setActiveTab] = useState<CreativeSource>(
    ad.creativeSource || 'upload'
  );
  const [attachedCreative, setAttachedCreative] = useState<AttachedCreative | null>(
    ad.attachedCreative || null
  );
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showProductImages, setShowProductImages] = useState(true);

  const images = productImages?.length ? productImages : DEFAULT_PRODUCT_IMAGES;
  const acceptType = isVideo ? 'video/*' : 'image/*';
  const filterType = isVideo ? 'video' as const : 'image' as const;

  const handleFileSelect = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const creative: AttachedCreative = {
      url,
      type: file.type.startsWith('video') ? 'video' : 'image',
      fileName: file.name,
    };
    setAttachedCreative(creative);
    onUpdateField('attachedCreative', creative);
    onUpdateField('creativeSource', 'upload');
  }, [onUpdateField]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  const handleLibrarySelect = (asset: { url: string; type: 'image' | 'video'; name: string }) => {
    const creative: AttachedCreative = { url: asset.url, type: asset.type, fileName: asset.name };
    setAttachedCreative(creative);
    onUpdateField('attachedCreative', creative);
    onUpdateField('creativeSource', 'library');
  };

  const handleProductImageSelect = (url: string) => {
    const creative: AttachedCreative = { url, type: 'image', fileName: 'Product Image' };
    setAttachedCreative(creative);
    onUpdateField('attachedCreative', creative);
    onUpdateField('creativeSource', activeTab);
  };

  const removeCreative = () => {
    setAttachedCreative(null);
    onUpdateField('attachedCreative', null);
  };

  const hasCreative = !!attachedCreative;
  const hasAdCopy = !!(ad.headline && ad.cta);
  const canLock = activeTab === 'ai-generate' ? true : (hasCreative && hasAdCopy);

  const tabs = [
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    { id: 'library' as const, label: 'Library', icon: FolderOpen },
    { id: 'ai-generate' as const, label: 'AI Generate', icon: Sparkles },
  ];

  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  // Product images strip shared between Upload and Library
  const ProductImagesStrip = () => {
    if (!images.length) return null;
    return (
      <div className="space-y-2">
        <button
          onClick={() => setShowProductImages(!showProductImages)}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Sparkles className="w-3 h-3 text-primary/60" />
          <span className="font-medium">From your product page</span>
          <span className="text-muted-foreground/40">· {images.length} found</span>
        </button>
        {showProductImages && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => handleProductImageSelect(url)}
                className="shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-border/30 hover:border-primary/50 hover:ring-1 hover:ring-primary/20 transition-all group relative"
              >
                <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("transition-all", isFrozen && "opacity-60 pointer-events-none")}>
      {/* Pill segmented control */}
      <div className="relative flex rounded-full bg-muted/30 p-0.5 mb-5">
        {/* Sliding indicator */}
        <div
          className="absolute top-0.5 bottom-0.5 rounded-full bg-background shadow-sm border border-border/40 transition-all duration-300 ease-out"
          style={{
            width: `${100 / tabs.length}%`,
            left: `${(activeIndex * 100) / tabs.length}%`,
          }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); onUpdateField('creativeSource', tab.id); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors relative z-10 rounded-full",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            <tab.icon className={cn(
              "w-3.5 h-3.5 transition-colors",
              tab.id === 'ai-generate' && activeTab === tab.id && "text-primary"
            )} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {activeTab === 'upload' && (
        <div className="space-y-4 animate-fade-in">
          {/* Product images strip */}
          <ProductImagesStrip />

          {!attachedCreative ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative rounded-xl p-6 text-center cursor-pointer transition-all overflow-hidden group",
                dragActive
                  ? "bg-primary/8 scale-[1.01] ring-2 ring-primary/30"
                  : "bg-muted/10 hover:bg-muted/20"
              )}
            >
              {/* Subtle gradient border */}
              <div className="absolute inset-0 rounded-xl border border-border/30 group-hover:border-primary/30 transition-colors" />
              <input ref={fileInputRef} type="file" accept={acceptType} className="hidden" onChange={handleUpload} />
              <div className={cn(
                "w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all",
                dragActive ? "bg-primary/15 scale-110" : "bg-muted/30 group-hover:bg-primary/10"
              )}>
                <Upload className={cn("w-4.5 h-4.5 transition-colors", dragActive ? "text-primary" : "text-muted-foreground/50 group-hover:text-primary/70")} />
              </div>
              <p className="text-[12px] font-medium text-foreground/70 mb-0.5 relative">
                {dragActive ? 'Drop here' : `Drop ${isVideo ? 'video' : 'image'} or browse`}
              </p>
              <p className="text-[10px] text-muted-foreground/40 relative">
                {isVideo ? 'MP4, MOV · Max 100MB' : 'JPG, PNG, WebP · Max 20MB'}
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden group">
              {/* Glassmorphism card */}
              <div className="bg-muted/10 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden">
                {attachedCreative.type === 'video' ? (
                  <div className="aspect-video bg-muted/20 relative">
                    <video src={attachedCreative.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 text-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted/20">
                    <img src={attachedCreative.url} alt="Creative" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="px-3 py-2 flex items-center gap-2 bg-background/50 backdrop-blur-sm">
                  <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span className="text-[11px] text-foreground font-medium truncate">{attachedCreative.fileName}</span>
                  <button onClick={removeCreative} className="text-[10px] text-destructive/60 hover:text-destructive ml-auto shrink-0 transition-colors">Replace</button>
                </div>
              </div>
              <button
                onClick={removeCreative}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md border border-border/20"
              >
                <X className="w-3 h-3 text-foreground group-hover:text-destructive-foreground" />
              </button>
            </div>
          )}

          {/* Ad copy fields */}
          <CompactAdFields
            headline={ad.headline || ''}
            primaryText={ad.primaryText || ''}
            cta={ad.cta || ''}
            description={ad.description || ''}
            onUpdate={onUpdateAdCopy}
          />
        </div>
      )}

      {/* Library tab */}
      {activeTab === 'library' && (
        <div className="space-y-4 animate-fade-in">
          {/* Product images strip */}
          <ProductImagesStrip />

          {!attachedCreative ? (
            <div className="space-y-3">
              {/* Mini grid of recent library assets */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop', name: 'Hero Shot' },
                  { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop', name: 'Lifestyle' },
                  { url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=200&h=200&fit=crop', name: 'Detail' },
                ].map((asset, i) => (
                  <button
                    key={i}
                    onClick={() => handleLibrarySelect({ url: asset.url, type: 'image', name: asset.name })}
                    className="aspect-square rounded-lg overflow-hidden border border-border/30 hover:border-primary/50 hover:ring-1 hover:ring-primary/20 transition-all group relative"
                  >
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  onClick={() => setLibraryOpen(true)}
                  className="aspect-square rounded-lg border border-dashed border-border/40 hover:border-primary/40 flex flex-col items-center justify-center gap-1 transition-all hover:bg-muted/10 group"
                >
                  <FolderOpen className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  <span className="text-[9px] text-muted-foreground/50 group-hover:text-foreground/60">See all</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden group">
              <div className="bg-muted/10 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden">
                <div className="aspect-video bg-muted/20">
                  <img src={attachedCreative.url} alt="Creative" className="w-full h-full object-cover" />
                </div>
                <div className="px-3 py-2 flex items-center gap-2 bg-background/50 backdrop-blur-sm">
                  <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span className="text-[11px] text-foreground font-medium truncate">{attachedCreative.fileName}</span>
                  <button onClick={() => setLibraryOpen(true)} className="text-[10px] text-primary/70 hover:text-primary ml-auto shrink-0 transition-colors">Change</button>
                </div>
              </div>
              <button
                onClick={removeCreative}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md border border-border/20"
              >
                <X className="w-3 h-3 text-foreground" />
              </button>
            </div>
          )}

          {/* Ad copy fields */}
          <CompactAdFields
            headline={ad.headline || ''}
            primaryText={ad.primaryText || ''}
            cta={ad.cta || ''}
            description={ad.description || ''}
            onUpdate={onUpdateAdCopy}
          />

          <CreativeLibraryPicker
            open={libraryOpen}
            onOpenChange={setLibraryOpen}
            filterType={filterType}
            onSelect={handleLibrarySelect}
            productImages={images}
          />
        </div>
      )}

      {/* AI Generate tab */}
      {activeTab === 'ai-generate' && (
        <div className="space-y-4 animate-fade-in">
          {/* Soft inline chip warning */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-500/8 border border-amber-500/15">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-600/80">Takes 1–3 min per creative · configure others while waiting</p>
          </div>

          {/* Existing full brief */}
          {isVideo ? (
            <VideoCreativeBrief
              ad={ad}
              frozenAds={frozenAds}
              onToggleFreeze={onToggleFreeze}
              onUpdateField={onUpdateField}
            />
          ) : (
            <ImageCreativeBrief
              ad={ad}
              frozenAds={frozenAds}
              onToggleFreeze={onToggleFreeze}
              onUpdateField={onUpdateField}
            />
          )}
        </div>
      )}

      {/* Lock button — Upload/Library tabs only */}
      {activeTab !== 'ai-generate' && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFreeze(adKey); }}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium transition-all mt-5",
            isFrozen
              ? "bg-secondary/10 text-secondary border border-secondary/20"
              : canLock
                ? "bg-primary/8 text-primary border border-primary/20 hover:bg-primary/12 hover:shadow-sm"
                : "bg-muted/15 text-muted-foreground/50 border border-border/20 cursor-not-allowed"
          )}
          disabled={!canLock && !isFrozen}
        >
          {isFrozen ? (
            <><Lock className="w-3.5 h-3.5" /> Locked <Check className="w-3 h-3" /></>
          ) : canLock ? (
            <><Unlock className="w-3.5 h-3.5" /> Lock Creative</>
          ) : (
            <><Unlock className="w-3.5 h-3.5" /> Attach creative to lock</>
          )}
        </button>
      )}
    </div>
  );
};
