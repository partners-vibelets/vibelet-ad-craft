import { useState, useRef, useCallback } from 'react';
import { Upload, FolderOpen, Sparkles, Play, X, Check, Lock, Unlock, AlertTriangle } from 'lucide-react';
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
}

export const CreativeSourceTabs = ({
  ad, isVideo, frozenAds, onToggleFreeze, onUpdateField, onUpdateAdCopy
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

  const removeCreative = () => {
    setAttachedCreative(null);
    onUpdateField('attachedCreative', null);
  };

  const hasCreative = !!attachedCreative;
  const hasAdCopy = !!(ad.headline && ad.cta);
  const canLock = activeTab === 'ai-generate' ? true : (hasCreative && hasAdCopy);

  const tabs = [
    { id: 'upload' as const, label: 'Upload', icon: Upload, description: 'Your own creative' },
    { id: 'library' as const, label: 'Library', icon: FolderOpen, description: 'From assets' },
    { id: 'ai-generate' as const, label: 'AI Generate', icon: Sparkles, description: '1-3 min' },
  ];

  return (
    <div className={cn("transition-all", isFrozen && "opacity-60 pointer-events-none")}>
      {/* Source tabs */}
      <div className="flex rounded-xl border border-border/30 overflow-hidden mb-5 bg-muted/10">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); onUpdateField('creativeSource', tab.id); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-medium transition-all relative",
              i > 0 && "border-l border-border/20",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {activeTab === 'upload' && (
        <div className="space-y-5 animate-fade-in">
          {!attachedCreative ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border/30 hover:border-primary/30 hover:bg-muted/10"
              )}
            >
              <input ref={fileInputRef} type="file" accept={acceptType} className="hidden" onChange={handleUpload} />
              <Upload className={cn("w-8 h-8 mx-auto mb-3 transition-colors", dragActive ? "text-primary" : "text-muted-foreground/30")} />
              <p className="text-[12px] font-medium text-foreground/70 mb-1">
                {dragActive ? 'Drop your file here' : `Drag & drop ${isVideo ? 'video' : 'image'} or click to browse`}
              </p>
              <p className="text-[10px] text-muted-foreground/50">
                {isVideo ? 'MP4, MOV · Max 100MB' : 'JPG, PNG, WebP · Max 20MB'}
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-border/30 group">
              {attachedCreative.type === 'video' ? (
                <div className="aspect-video bg-muted relative">
                  <video src={attachedCreative.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted">
                  <img src={attachedCreative.url} alt="Creative" className="w-full h-full object-cover" />
                </div>
              )}
              <button
                onClick={removeCreative}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
              >
                <X className="w-3.5 h-3.5 text-destructive-foreground" />
              </button>
              <div className="px-3 py-2 bg-muted/10 border-t border-border/20 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="text-[11px] text-foreground font-medium truncate">{attachedCreative.fileName}</span>
                <button onClick={removeCreative} className="text-[10px] text-destructive/60 hover:text-destructive ml-auto shrink-0 transition-colors">Replace</button>
              </div>
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
        <div className="space-y-5 animate-fade-in">
          {!attachedCreative ? (
            <button
              onClick={() => setLibraryOpen(true)}
              className="w-full border-2 border-dashed border-border/30 hover:border-primary/30 rounded-xl p-8 text-center transition-all hover:bg-muted/10 group"
            >
              <FolderOpen className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
              <p className="text-[12px] font-medium text-foreground/70 mb-1">Browse Creative Library</p>
              <p className="text-[10px] text-muted-foreground/50">Select from your existing {isVideo ? 'videos' : 'images'}</p>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-border/30 group">
              <div className="aspect-video bg-muted">
                <img src={attachedCreative.url} alt="Creative" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={removeCreative}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
              >
                <X className="w-3.5 h-3.5 text-destructive-foreground" />
              </button>
              <div className="px-3 py-2 bg-muted/10 border-t border-border/20 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="text-[11px] text-foreground font-medium truncate">{attachedCreative.fileName}</span>
                <button onClick={() => setLibraryOpen(true)} className="text-[10px] text-primary/70 hover:text-primary ml-auto shrink-0 transition-colors">Change</button>
              </div>
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
          />
        </div>
      )}

      {/* AI Generate tab */}
      {activeTab === 'ai-generate' && (
        <div className="space-y-4 animate-fade-in">
          {/* Time warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-medium text-amber-600">AI generation takes 1–3 minutes per creative</p>
              <p className="text-[10px] text-amber-500/70 mt-0.5">You can configure other ads while this one generates</p>
            </div>
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

      {/* Lock button — only show for Upload/Library tabs (AI Generate has its own) */}
      {activeTab !== 'ai-generate' && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFreeze(adKey); }}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-medium transition-all border mt-6",
            isFrozen
              ? "bg-secondary/10 border-secondary/30 text-secondary"
              : canLock
                ? "bg-primary/10 border-primary/40 text-primary hover:bg-primary/15"
                : "bg-muted/20 border-border/30 text-muted-foreground"
          )}
          disabled={!canLock && !isFrozen}
        >
          {isFrozen ? (
            <><Lock className="w-3.5 h-3.5" /> Creative Locked ✓</>
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
