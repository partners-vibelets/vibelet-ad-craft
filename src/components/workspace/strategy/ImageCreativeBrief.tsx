import { useState } from 'react';
import {
  Lock, Unlock, Upload, Palette, Check, Square, Smartphone, Monitor,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineEdit } from './InlineEdit';

interface ImageCreativeBriefProps {
  ad: any;
  frozenAds: Set<string>;
  onToggleFreeze: (adKey: string) => void;
  onUpdateField: (field: string, value: any) => void;
}

const STYLE_PRESETS = [
  { id: 'lifestyle', label: 'Lifestyle', emoji: '🏡' },
  { id: 'studio', label: 'Studio', emoji: '📸' },
  { id: 'flat-lay', label: 'Flat Lay', emoji: '🎨' },
  { id: 'in-use', label: 'In Use', emoji: '👟' },
  { id: 'seasonal', label: 'Seasonal', emoji: '🌸' },
  { id: 'minimal', label: 'Minimal', emoji: '⬜' },
];

export const ImageCreativeBrief = ({ ad, frozenAds, onToggleFreeze, onUpdateField }: ImageCreativeBriefProps) => {
  const adKey = ad.name;
  const isFrozen = frozenAds.has(adKey);
  const brief = ad.creativeBrief || {};
  const productImages = brief.productImages || [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop',
  ];
  const [selectedImg, setSelectedImg] = useState<number>(brief.selectedImageIdx || 0);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(brief.stylePreset || null);

  const completedFields = [
    true, // product image always available
    !!selectedStyle,
    !!(brief.visualDirection && brief.visualDirection !== 'Describe the visual style...'),
  ];
  const completedCount = completedFields.filter(Boolean).length;
  const totalFields = completedFields.length;

  return (
    <div className={cn("transition-all", isFrozen && "opacity-60 pointer-events-none")}>
      {/* Completion indicator */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex gap-1">
          {completedFields.map((done, i) => (
            <div key={i} className={cn("w-8 h-1.5 rounded-full transition-colors", done ? "bg-secondary" : "bg-muted/40")} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">{completedCount}/{totalFields} configured</span>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* LEFT: Selected image preview + thumbnails */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden border border-border/25 bg-muted/10 relative group">
            <img
              src={productImages[selectedImg]}
              alt={`Product reference ${selectedImg + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
            </div>
          </div>
          {/* Thumbnail strip */}
          <div className="grid grid-cols-4 gap-2">
            {productImages.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => { setSelectedImg(i); onUpdateField('selectedImageIdx', i); }}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
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
              </button>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/40 text-center">Scraped from product page · Click to select reference</p>
        </div>

        {/* RIGHT: Style + direction + format */}
        <div className="space-y-5">
          {/* Style Presets */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5 font-medium">
              Style Preset {selectedStyle && <Check className="w-3 h-3 text-secondary inline ml-1" />}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_PRESETS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStyle(s.id); onUpdateField('stylePreset', s.id); }}
                  className={cn(
                    "px-2 py-2.5 rounded-xl text-[11px] font-medium border transition-all text-center",
                    selectedStyle === s.id
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/30 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <span className="block text-base mb-1">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Direction */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Visual Direction
            </p>
            <InlineEdit
              value={brief.visualDirection || ad.visualDirection || 'Describe the visual style...'}
              onSave={v => onUpdateField('visualDirection', v)}
              className="text-[12px] leading-relaxed"
              multiline
            />
          </div>

          {/* Output Format */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5 font-medium">Output Format</p>
            <div className="flex gap-2">
              {[
                { value: '1:1', label: 'Square', icon: <Square className="w-3 h-3" /> },
                { value: '4:5', label: 'Portrait', icon: <Smartphone className="w-3 h-3" /> },
                { value: '1.91:1', label: 'Landscape', icon: <Monitor className="w-3 h-3" /> },
              ].map(f => (
                <button key={f.value} className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all",
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
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Offer / Hook Text</p>
            <InlineEdit
              value={brief.offerHook || ad.offerHook || 'e.g. 25% off Spring Sale'}
              onSave={v => onUpdateField('offerHook', v)}
              className="text-[12px]"
            />
          </div>

          {/* Upload additional */}
          <button className="w-full py-3 rounded-xl border-2 border-dashed border-border/25 hover:border-primary/30 flex items-center justify-center gap-2 transition-all bg-muted/5 hover:bg-muted/15 group">
            <Upload className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/50 transition-colors" />
            <span className="text-[10px] font-medium text-muted-foreground/50 group-hover:text-foreground/60 transition-colors">Upload Additional Reference</span>
          </button>
        </div>
      </div>

      {/* Lock button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFreeze(adKey); }}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium transition-all border mt-6",
          isFrozen
            ? "bg-secondary/10 border-secondary/30 text-secondary"
            : completedCount === totalFields
              ? "bg-primary/10 border-primary/40 text-primary hover:bg-primary/15"
              : "bg-muted/20 border-border/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        )}
      >
        {isFrozen ? <><Lock className="w-3.5 h-3.5" /> Creative Locked ✓</> : <><Unlock className="w-3.5 h-3.5" /> Lock Creative Strategy</>}
      </button>
    </div>
  );
};
