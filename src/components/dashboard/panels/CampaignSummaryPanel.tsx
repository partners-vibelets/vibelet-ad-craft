import { useState } from 'react';
import { CampaignState } from '@/types/campaign';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Target, 
  DollarSign, 
  MousePointer, 
  Clock,
  Facebook,
  Play,
  Image,
  Smartphone,
  Monitor,
  ThumbsUp,
  MessageCircle,
  Share2,
  Heart,
  MoreHorizontal
} from 'lucide-react';

interface CampaignSummaryPanelProps {
  state: CampaignState;
}

export const CampaignSummaryPanel = ({ state }: CampaignSummaryPanelProps) => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const { productData, selectedCreative, campaignConfig, selectedAdAccount } = state;

  return (
    <div className="p-6 space-y-6">
      {/* Header with Device Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Campaign Preview</h2>
          <p className="text-xs text-muted-foreground">See how your ad will appear</p>
        </div>
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setDevice('mobile')}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              device === 'mobile' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Smartphone className="w-3 h-3" />
            Mobile
          </button>
          <button
            onClick={() => setDevice('desktop')}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              device === 'desktop' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Monitor className="w-3 h-3" />
            Desktop
          </button>
        </div>
      </div>

      {/* Ad Preview */}
      <div className="flex justify-center">
        {device === 'mobile' ? (
          <MobilePreview 
            creative={selectedCreative}
            productData={productData}
            cta={campaignConfig?.cta || 'Shop Now'}
          />
        ) : (
          <DesktopPreview 
            creative={selectedCreative}
            productData={productData}
            cta={campaignConfig?.cta || 'Shop Now'}
          />
        )}
      </div>

      {/* Campaign Details Summary */}
      <div className="grid grid-cols-2 gap-3">
        {campaignConfig && (
          <>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="w-3 h-3" />
                <span className="text-[10px] uppercase tracking-wide">Objective</span>
              </div>
              <p className="text-sm font-medium text-foreground">{campaignConfig.objective}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-3 h-3" />
                <span className="text-[10px] uppercase tracking-wide">Budget</span>
              </div>
              <p className="text-sm font-medium text-foreground">${campaignConfig.budget}/day</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MousePointer className="w-3 h-3" />
                <span className="text-[10px] uppercase tracking-wide">CTA</span>
              </div>
              <p className="text-sm font-medium text-foreground">{campaignConfig.cta}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] uppercase tracking-wide">Duration</span>
              </div>
              <p className="text-sm font-medium text-foreground">{campaignConfig.duration}</p>
            </div>
          </>
        )}
      </div>

      {/* Facebook Account */}
      {selectedAdAccount && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1877F2]/5 border border-[#1877F2]/20">
          <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
            <Facebook className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{selectedAdAccount.name}</p>
            <p className="text-xs text-muted-foreground">{selectedAdAccount.status}</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
        </div>
      )}

      {/* Total Estimate */}
      {campaignConfig && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated Total</span>
            <span className="text-lg font-bold text-primary">
              ${campaignConfig.duration === 'Ongoing' 
                ? `${campaignConfig.budget}/day` 
                : (parseInt(campaignConfig.budget) * parseInt(campaignConfig.duration)).toLocaleString()
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface PreviewProps {
  creative: { thumbnail: string; type: string; name: string } | null;
  productData: { title: string; description: string } | null;
  cta: string;
}

const MobilePreview = ({ creative, productData, cta }: PreviewProps) => {
  if (!creative) return null;
  
  return (
    <div className="w-[260px] bg-background border border-border rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-2.5 flex items-center gap-2 border-b border-border/50">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70" />
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-foreground">Your Business</p>
          <p className="text-[9px] text-muted-foreground">Sponsored</p>
        </div>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Text */}
      <div className="px-2.5 py-2">
        <p className="text-[11px] text-foreground line-clamp-2">
          {productData?.description?.slice(0, 80) || 'Check out our amazing product!'}...
        </p>
      </div>

      {/* Creative */}
      <div className="relative aspect-square">
        <img src={creative.thumbnail} alt="Ad" className="w-full h-full object-cover" />
        {creative.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-4 h-4 text-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-2.5 bg-muted/30 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <p className="text-[9px] text-muted-foreground uppercase">yourstore.com</p>
            <p className="text-[11px] font-semibold text-foreground truncate">
              {productData?.title || 'Product'}
            </p>
          </div>
          <button className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded flex-shrink-0">
            {cta}
          </button>
        </div>
      </div>

      {/* Engagement */}
      <div className="px-2.5 py-1.5 flex items-center justify-between border-t border-border/50">
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-2.5 h-2.5 text-[#1877F2]" fill="#1877F2" />
          <span className="text-[9px] text-muted-foreground">142</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ThumbsUp className="w-3.5 h-3.5" />
          <MessageCircle className="w-3.5 h-3.5" />
          <Share2 className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

const DesktopPreview = ({ creative, productData, cta }: PreviewProps) => {
  if (!creative) return null;
  
  return (
    <div className="w-full max-w-[340px] bg-background border border-border rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-3 flex items-center gap-2.5 border-b border-border/50">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">Your Business</p>
          <p className="text-[10px] text-muted-foreground">Sponsored · 🌐</p>
        </div>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Text */}
      <div className="px-3 py-2">
        <p className="text-xs text-foreground line-clamp-2">
          {productData?.description || 'Check out our amazing product!'}
        </p>
      </div>

      {/* Creative */}
      <div className="relative aspect-video">
        <img src={creative.thumbnail} alt="Ad" className="w-full h-full object-cover" />
        {creative.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-3 bg-muted/30 border-t border-border/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase">yourstore.com</p>
            <p className="text-xs font-semibold text-foreground truncate">{productData?.title || 'Product'}</p>
          </div>
          <button className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded flex-shrink-0">
            {cta}
          </button>
        </div>
      </div>

      {/* Engagement */}
      <div className="px-3 py-2 flex items-center justify-between border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center">
              <ThumbsUp className="w-2 h-2 text-white" fill="white" />
            </div>
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
              <Heart className="w-2 h-2 text-white" fill="white" />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground">142</span>
        </div>
        <span className="text-[10px] text-muted-foreground">12 comments</span>
      </div>
    </div>
  );
};
