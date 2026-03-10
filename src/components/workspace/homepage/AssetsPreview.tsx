import { ImageIcon, Upload, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoAsset } from '@/data/homepageDemoData';

interface AssetsPreviewProps {
  assets: DemoAsset[];
  onUpload: () => void;
  onGenerate: () => void;
}

export const AssetsPreview = ({ assets, onUpload, onGenerate }: AssetsPreviewProps) => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Assets</h3>
      </div>
    </div>

    {assets.length === 0 ? (
      <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">No assets yet — Upload or Generate</p>
        <div className="flex items-center gap-2 justify-center">
          <button onClick={onUpload} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
          <button onClick={onGenerate} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary hover:bg-primary/15 transition-all">
            <Sparkles className="w-3.5 h-3.5" /> Generate
          </button>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {assets.slice(0, 4).map((asset, i) => (
          <div
            key={asset.id}
            className="rounded-xl border border-border/40 bg-card/60 p-3 space-y-2 hover:bg-muted/30 hover:border-border transition-all cursor-pointer animate-fade-in"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
          >
            <div className="w-full aspect-video rounded-lg bg-muted/30 flex items-center justify-center text-2xl">
              {asset.thumbnail}
            </div>
            <div>
              <p className="text-[11px] font-medium text-foreground truncate">{asset.name}</p>
              <p className="text-[10px] text-muted-foreground">{asset.type} · {asset.dimensions} · {asset.date}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
