import { useState } from 'react';
import { X, Search, Check, Film, ImageIcon, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Mock library assets
const LIBRARY_ASSETS = [
  { id: 'lib-1', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', type: 'image' as const, name: 'Product Hero Shot', date: '2 days ago' },
  { id: 'lib-2', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop', type: 'image' as const, name: 'Lifestyle - Outdoor', date: '5 days ago' },
  { id: 'lib-3', url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop', type: 'image' as const, name: 'Close-up Detail', date: '1 week ago' },
  { id: 'lib-4', url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop', type: 'image' as const, name: 'Collection Flat Lay', date: '1 week ago' },
  { id: 'lib-5', url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop', type: 'image' as const, name: 'Action Shot', date: '2 weeks ago' },
  { id: 'lib-6', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop', type: 'image' as const, name: 'Minimal Studio', date: '2 weeks ago' },
  { id: 'lib-v1', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', type: 'video' as const, name: 'Unboxing Reel', date: '3 days ago' },
  { id: 'lib-v2', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop', type: 'video' as const, name: 'Product Demo', date: '1 week ago' },
];

interface CreativeLibraryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterType?: 'image' | 'video' | 'all';
  onSelect: (asset: { url: string; type: 'image' | 'video'; name: string }) => void;
  productImages?: string[];
}

export const CreativeLibraryPicker = ({ open, onOpenChange, filterType = 'all', onSelect, productImages }: CreativeLibraryPickerProps) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);

  const filtered = LIBRARY_ASSETS.filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleConfirm = () => {
    if (selectedProductImage) {
      onSelect({ url: selectedProductImage, type: 'image', name: 'Product Image' });
      onOpenChange(false);
      setSelected(null);
      setSelectedProductImage(null);
      setSearch('');
      return;
    }
    const asset = LIBRARY_ASSETS.find(a => a.id === selected);
    if (asset) {
      onSelect({ url: asset.url, type: asset.type, name: asset.name });
      onOpenChange(false);
      setSelected(null);
      setSearch('');
    }
  };

  const hasSelection = !!selected || !!selectedProductImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[90vw] p-0 bg-background border-border overflow-hidden">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-muted/50 hover:bg-muted border border-border/30 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-foreground" />
        </button>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Creative Library</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Select from your existing assets</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full bg-muted/20 border border-border/30 rounded-lg pl-9 pr-3 py-2 text-[12px] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40 transition-all"
            />
          </div>

          {/* Product images section */}
          {productImages && productImages.length > 0 && !search && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary/60" />
                <span className="text-[10px] font-medium text-muted-foreground">From your product page</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {productImages.map((url, i) => (
                  <button
                    key={`product-${i}`}
                    onClick={() => { setSelectedProductImage(url); setSelected(null); }}
                    className={cn(
                      "shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative",
                      selectedProductImage === url
                        ? "border-primary ring-1 ring-primary/20 shadow-md"
                        : "border-border/30 hover:border-primary/30"
                    )}
                  >
                    <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                    {selectedProductImage === url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-border/15 pt-2">
                <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider font-medium">Library</span>
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
            {filtered.map(asset => (
              <button
                key={asset.id}
                onClick={() => { setSelected(asset.id); setSelectedProductImage(null); }}
                className={cn(
                  "rounded-xl border-2 overflow-hidden transition-all text-left relative group",
                  selected === asset.id
                    ? "border-primary ring-1 ring-primary/20 shadow-md"
                    : "border-border/30 hover:border-primary/30"
                )}
              >
                <div className="aspect-square bg-muted overflow-hidden relative">
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  {asset.type === 'video' && (
                    <div className="absolute top-1.5 left-1.5">
                      <Film className="w-3.5 h-3.5 text-white drop-shadow-md" />
                    </div>
                  )}
                  {selected === asset.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-2 py-1.5">
                  <p className="text-[10px] font-medium text-foreground truncate">{asset.name}</p>
                  <p className="text-[9px] text-muted-foreground/60">{asset.date}</p>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <ImageIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-[11px] text-muted-foreground">No assets found</p>
            </div>
          )}

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={!hasSelection}
            className={cn(
              "w-full py-2.5 rounded-xl text-xs font-medium transition-all",
              hasSelection
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted/30 text-muted-foreground cursor-not-allowed"
            )}
          >
            {hasSelection ? 'Use This Creative' : 'Select an asset'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
