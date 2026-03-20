import { useState, useRef, useCallback } from 'react';
import {
  Lock, Unlock, Upload, Palette, Check, Square, Smartphone, Monitor,
  Eye, Wand2, FolderOpen, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineEdit } from './InlineEdit';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageCreativeBriefProps {
  ad: any;
  frozenAds: Set<string>;
  onToggleFreeze: (adKey: string) => void;
  onUpdateField: (field: string, value: any) => void;
}

const STYLE_PRESETS = [
  { id: 'lifestyle', label: 'Lifestyle', emoji: '🏡', description: 'Natural, real-world settings that show the product in everyday life' },
  { id: 'studio', label: 'Studio', emoji: '📸', description: 'Clean, professional studio shots with controlled lighting' },
  { id: 'flat-lay', label: 'Flat Lay', emoji: '🎨', description: 'Overhead arrangement with complementary items and props' },
  { id: 'in-use', label: 'In Use', emoji: '👟', description: 'Action shots showing the product being used by real people' },
  { id: 'seasonal', label: 'Seasonal', emoji: '🌸', description: 'Themed visuals tied to seasons, holidays, or trending moments' },
  { id: 'minimal', label: 'Minimal', emoji: '⬜', description: 'Ultra-clean compositions with maximum negative space' },
];

export const ImageCreativeBrief = ({ ad, frozenAds, onToggleFreeze, onUpdateField }: ImageCreativeBriefProps) => {
  const adKey = ad.name;
  const isFrozen = frozenAds.has(adKey);
  const brief = ad.creativeBrief || {};
  const defaultImages = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop',
  ];
  const defaultImageCount = defaultImages.length;
  const [productImages, setProductImages] = useState<string[]>(brief.productImages || defaultImages);
  const [selectedImg, setSelectedImg] = useState<number>(brief.selectedImageIdx || 0);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(brief.stylePreset || null);
  const [isGeneratingDirection, setIsGeneratingDirection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Style preview lightbox
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewStyle, setPreviewStyle] = useState<typeof STYLE_PRESETS[0] | null>(null);

  const completedFields = [
    true, // product image always available
    !!selectedStyle,
    !!(brief.visualDirection && brief.visualDirection !== 'Describe the visual style...'),
  ];
  const completedCount = completedFields.filter(Boolean).length;
  const totalFields = completedFields.length;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newImages = [...productImages, url];
    setProductImages(newImages);
    setSelectedImg(newImages.length - 1);
    onUpdateField('productImages', newImages);
    onUpdateField('selectedImageIdx', newImages.length - 1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = (index: number) => {
    if (productImages.length <= 1) return;
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages);
    const newSelected = selectedImg >= newImages.length
      ? newImages.length - 1
      : selectedImg > index
        ? selectedImg - 1
        : selectedImg === index
          ? Math.min(index, newImages.length - 1)
          : selectedImg;
    setSelectedImg(newSelected);
    onUpdateField('productImages', newImages);
    onUpdateField('selectedImageIdx', newSelected);
  };

  const isUserAdded = (index: number) => index >= defaultImageCount;

  // Drag-and-drop reordering
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    dragIndexRef.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((index: number) => {
    const from = dragIndexRef.current;
    if (from === null || from === index) { setDragOverIndex(null); return; }
    const reordered = [...productImages];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(index, 0, moved);
    setProductImages(reordered);
    let newSelected = selectedImg;
    if (selectedImg === from) newSelected = index;
    else if (from < selectedImg && index >= selectedImg) newSelected = selectedImg - 1;
    else if (from > selectedImg && index <= selectedImg) newSelected = selectedImg + 1;
    setSelectedImg(newSelected);
    onUpdateField('productImages', reordered);
    onUpdateField('selectedImageIdx', newSelected);
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }, [productImages, selectedImg, onUpdateField]);

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }, []);

  const handleGenerateDirection = () => {
    setIsGeneratingDirection(true);
    setTimeout(() => {
      const generated = `Clean, aspirational ${selectedStyle || 'lifestyle'} photography with soft natural lighting. Product centered with complementary props. Warm color palette with muted earth tones. Shallow depth of field to draw focus to the product details.`;
      onUpdateField('visualDirection', generated);
      setIsGeneratingDirection(false);
    }, 1200);
  };

  const openStylePreview = (style: typeof STYLE_PRESETS[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewStyle(style);
    setPreviewOpen(true);
  };

  return (
    <div className={cn("transition-all", isFrozen && "opacity-60 pointer-events-none")}>
      {/* Completion indicator */}
      <div className="flex items-center gap-2.5 mb-7">
        <div className="flex gap-1">
          {completedFields.map((done, i) => (
            <div key={i} className={cn("w-10 h-1.5 rounded-full transition-colors", done ? "bg-secondary" : "bg-muted/40")} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">{completedCount}/{totalFields} configured</span>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* LEFT: Product images + upload */}
        <div className="space-y-4">
          {/* Main preview */}
          <div className="aspect-square rounded-xl overflow-hidden border border-border/25 bg-muted/10 relative group">
            <img
              src={productImages[selectedImg]}
              alt={`Product reference ${selectedImg + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
              <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
            </div>
            {/* Delete badge for user-added images */}
            {isUserAdded(selectedImg) && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteImage(selectedImg); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5 text-destructive-foreground" />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          <div className="grid grid-cols-4 gap-2">
            {productImages.map((img: string, i: number) => (
              <div
                key={i}
                onClick={() => { setSelectedImg(i); onUpdateField('selectedImageIdx', i); }}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group/thumb",
                  selectedImg === i
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-border/20 hover:border-primary/30 opacity-50 hover:opacity-100"
                )}
              >
                <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                {selectedImg === i && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
                {/* Delete button for user-added thumbnails */}
                {isUserAdded(i) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteImage(i); }}
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-destructive/90 hover:bg-destructive flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all z-10 shadow-sm"
                    title="Remove image"
                  >
                    <X className="w-2.5 h-2.5 text-destructive-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/40 text-center">Scraped from product page · Click to select reference</p>

          {/* Upload + Library buttons under carousel */}
          <div className="grid grid-cols-2 gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 rounded-xl border-2 border-dashed border-border/25 hover:border-primary/30 flex items-center justify-center gap-1.5 transition-all bg-muted/5 hover:bg-muted/15 group/upload"
            >
              <Upload className="w-3 h-3 text-muted-foreground/40 group-hover/upload:text-primary/50 transition-colors" />
              <span className="text-[10px] font-medium text-muted-foreground/50 group-hover/upload:text-foreground/60 transition-colors">Upload</span>
            </button>
            <button className="py-2.5 rounded-xl border-2 border-dashed border-border/25 hover:border-primary/30 flex items-center justify-center gap-1.5 transition-all bg-muted/5 hover:bg-muted/15 group/lib">
              <FolderOpen className="w-3 h-3 text-muted-foreground/40 group-hover/lib:text-primary/50 transition-colors" />
              <span className="text-[10px] font-medium text-muted-foreground/50 group-hover/lib:text-foreground/60 transition-colors">From Library</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Style + direction + format */}
        <div className="divide-y divide-border/15 [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
          {/* Style Presets */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">
              Style Preset {selectedStyle && <Check className="w-3 h-3 text-secondary inline ml-1" />}
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {STYLE_PRESETS.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setSelectedStyle(s.id); onUpdateField('stylePreset', s.id); }}
                  className={cn(
                    "px-2 py-3 rounded-xl text-[11px] font-medium border transition-all text-center relative group cursor-pointer",
                    selectedStyle === s.id
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/30 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <span className="block text-lg mb-1">{s.emoji}</span>
                  {s.label}
                  {/* Preview eye — small corner button */}
                  <button
                    onClick={(e) => openStylePreview(s, e)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-10 hover:bg-background shadow-sm border border-border/30"
                  >
                    <Eye className="w-2.5 h-2.5 text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Direction */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Visual Direction
              </p>
              <button
                onClick={handleGenerateDirection}
                disabled={isGeneratingDirection}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {isGeneratingDirection ? (
                  <><div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-3 h-3" /> {brief.visualDirection ? 'Regenerate' : 'Auto-generate'}</>
                )}
              </button>
            </div>
            <InlineEdit
              value={brief.visualDirection || ad.visualDirection || 'Describe the visual style...'}
              onSave={v => onUpdateField('visualDirection', v)}
              className="text-[12px] leading-relaxed"
              multiline
            />
          </div>

          {/* Output Format */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">Output Format</p>
            <div className="flex gap-2.5">
              {[
                { value: '1:1', label: 'Square', icon: <Square className="w-3.5 h-3.5" /> },
                { value: '4:5', label: 'Portrait', icon: <Smartphone className="w-3.5 h-3.5" /> },
                { value: '1.91:1', label: 'Landscape', icon: <Monitor className="w-3.5 h-3.5" /> },
              ].map(f => (
                <button key={f.value} className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-medium border transition-all",
                  (brief.outputFormat || '1:1') === f.value
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/30 text-muted-foreground hover:border-primary/20"
                )} onClick={() => onUpdateField('outputFormat', f.value)}>
                  {f.icon}{f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Offer Hook */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2.5 font-medium">Offer / Hook Text</p>
            <InlineEdit
              value={brief.offerHook || ad.offerHook || 'e.g. 25% off Spring Sale'}
              onSave={v => onUpdateField('offerHook', v)}
              className="text-[12px]"
            />
          </div>
        </div>
      </div>

      {/* Lock button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFreeze(adKey); }}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-medium transition-all border mt-8",
          isFrozen
            ? "bg-secondary/10 border-secondary/30 text-secondary"
            : completedCount === totalFields
              ? "bg-primary/10 border-primary/40 text-primary hover:bg-primary/15"
              : "bg-muted/20 border-border/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        )}
      >
        {isFrozen ? <><Lock className="w-3.5 h-3.5" /> Creative Locked ✓</> : <><Unlock className="w-3.5 h-3.5" /> Lock Creative Strategy</>}
      </button>

      {/* Style Preview Lightbox */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-sm w-[85vw] p-0 bg-background/95 backdrop-blur-sm border-border overflow-hidden">
          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute top-3 right-3 z-50 p-2 rounded-full bg-background/80 hover:bg-background border border-border shadow-md transition-colors"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
          {previewStyle && (
            <div className="p-6 text-center space-y-3">
              <span className="text-4xl block">{previewStyle.emoji}</span>
              <p className="text-sm font-semibold text-foreground">{previewStyle.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{previewStyle.description}</p>
              <button
                onClick={() => { setSelectedStyle(previewStyle.id); onUpdateField('stylePreset', previewStyle.id); setPreviewOpen(false); }}
                className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                {selectedStyle === previewStyle.id ? 'Selected ✓' : 'Select This Style'}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
