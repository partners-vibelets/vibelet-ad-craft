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
  Smartphone,
  Monitor,
  ThumbsUp,
  MessageCircle,
  Share2,
  Heart,
  MoreHorizontal,
  Pencil,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CampaignSummaryPanelProps {
  state: CampaignState;
}

export const CampaignSummaryPanel = ({ state }: CampaignSummaryPanelProps) => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isEditingHeadline, setIsEditingHeadline] = useState(false);
  const [editedHeadline, setEditedHeadline] = useState('');
  
  const { productData, selectedCreative, campaignConfig, selectedAdAccount } = state;

  const displayTitle = editedTitle || campaignConfig?.campaignName || productData?.title || 'Your Product';
  const displayHeadline = editedHeadline || campaignConfig?.primaryText || productData?.description?.slice(0, 80) || 'Check out our amazing product!';

  // Format CTA for display
  const formatCta = (cta: string | undefined) => {
    if (!cta) return 'Shop Now';
    return cta.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate budget display
  const getBudgetDisplay = () => {
    if (!campaignConfig?.budgetAmount) return null;
    const amount = parseFloat(campaignConfig.budgetAmount);
    const duration = campaignConfig.duration === 'ongoing' ? 0 : parseInt(campaignConfig.duration);
    
    if (campaignConfig.duration === 'ongoing') {
      return `$${amount}/day`;
    }
    
    const total = campaignConfig.budgetType === 'daily' ? amount * duration : amount;
    return `$${total.toLocaleString()}`;
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Campaign Preview</h2>
          <p className="text-[10px] text-muted-foreground">Review your ad before publishing</p>
        </div>
      </div>

      {/* Main Layout - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left - Ad Preview */}
        <div className="space-y-3">
          {/* Device Toggle */}
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setDevice('mobile')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-colors",
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
                "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-colors",
                device === 'desktop' 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="w-3 h-3" />
              Desktop
            </button>
          </div>

          {/* Ad Preview */}
          {device === 'mobile' ? (
            <MobilePreview 
              creative={selectedCreative}
              title={displayTitle}
              headline={displayHeadline}
              cta={formatCta(campaignConfig?.cta)}
            />
          ) : (
            <DesktopPreview 
              creative={selectedCreative}
              title={displayTitle}
              headline={displayHeadline}
              cta={formatCta(campaignConfig?.cta)}
            />
          )}
        </div>

        {/* Right - Campaign Details */}
        <div className="space-y-3">
          {/* Editable Ad Copy */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-3 py-2 bg-muted/30 border-b border-border/50">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Ad Copy</p>
            </div>
            <div className="p-3 space-y-2.5">
              {/* Title */}
              <div className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Campaign Name</span>
                  <button 
                    onClick={() => {
                      setIsEditingTitle(!isEditingTitle);
                      if (!isEditingTitle) setEditedTitle(displayTitle);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                {isEditingTitle ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    className="h-7 text-xs"
                    autoFocus
                  />
                ) : (
                  <p className="text-xs font-medium text-foreground truncate">{displayTitle}</p>
                )}
              </div>
              
              {/* Headline */}
              <div className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Primary Text</span>
                  <button 
                    onClick={() => {
                      setIsEditingHeadline(!isEditingHeadline);
                      if (!isEditingHeadline) setEditedHeadline(displayHeadline);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                {isEditingHeadline ? (
                  <Input
                    value={editedHeadline}
                    onChange={(e) => setEditedHeadline(e.target.value)}
                    onBlur={() => setIsEditingHeadline(false)}
                    className="h-7 text-xs"
                    autoFocus
                  />
                ) : (
                  <p className="text-xs text-muted-foreground line-clamp-2">{displayHeadline}</p>
                )}
              </div>
            </div>
          </div>

          {/* Campaign Config */}
          {campaignConfig && (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-3 py-2 bg-muted/30 border-b border-border/50">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Settings</p>
              </div>
              <div className="p-2 grid grid-cols-2 gap-1.5">
                <ConfigItem icon={Target} label="Goal" value={campaignConfig.objective} />
                <ConfigItem icon={Layers} label="Budget Type" value={campaignConfig.budgetType === 'daily' ? 'Daily' : 'Lifetime'} />
                <ConfigItem icon={DollarSign} label="Budget" value={`$${campaignConfig.budgetAmount}/${campaignConfig.budgetType === 'daily' ? 'day' : 'total'}`} />
                <ConfigItem icon={MousePointer} label="CTA" value={formatCta(campaignConfig.cta)} />
                <ConfigItem icon={Clock} label="Duration" value={campaignConfig.duration === 'ongoing' ? 'Ongoing' : `${campaignConfig.duration} days`} />
                <ConfigItem icon={FileText} label="Ad Set" value={campaignConfig.adSetName?.slice(0, 20) + '...'} />
              </div>
            </div>
          )}

          {/* Facebook Account */}
          {selectedAdAccount && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#1877F2]/5 border border-[#1877F2]/20">
              <div className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                <Facebook className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{selectedAdAccount.name}</p>
                <p className="text-[10px] text-muted-foreground">{selectedAdAccount.status}</p>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            </div>
          )}

          {/* Total Estimate */}
          {campaignConfig && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Estimated Total</span>
                <span className="text-base font-bold text-primary">
                  {getBudgetDisplay()}
                </span>
              </div>
              {campaignConfig.duration !== 'ongoing' && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {campaignConfig.duration} days at ${campaignConfig.budgetAmount}/{campaignConfig.budgetType === 'daily' ? 'day' : 'total'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConfigItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
    <Icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-[11px] font-medium text-foreground truncate">{value}</p>
    </div>
  </div>
);

interface PreviewProps {
  creative: { thumbnail: string; type: string; name: string } | null;
  title: string;
  headline: string;
  cta: string;
}

const MobilePreview = ({ creative, title, headline, cta }: PreviewProps) => {
  if (!creative) return null;
  
  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="p-2 flex items-center gap-2 border-b border-border/50">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70" />
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-foreground">Your Business</p>
          <p className="text-[8px] text-muted-foreground">Sponsored</p>
        </div>
        <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* Text */}
      <div className="px-2 py-1.5">
        <p className="text-[10px] text-foreground line-clamp-2">{headline}...</p>
      </div>

      {/* Creative */}
      <div className="relative aspect-square">
        <img src={creative.thumbnail} alt="Ad" className="w-full h-full object-cover" />
        {creative.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-3 h-3 text-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-2 bg-muted/30 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <p className="text-[8px] text-muted-foreground uppercase">yourstore.com</p>
            <p className="text-[10px] font-semibold text-foreground truncate">{title}</p>
          </div>
          <button className="px-2.5 py-1 bg-primary text-primary-foreground text-[9px] font-semibold rounded flex-shrink-0">
            {cta}
          </button>
        </div>
      </div>

      {/* Engagement */}
      <div className="px-2 py-1 flex items-center justify-between border-t border-border/50">
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-2 h-2 text-[#1877F2]" fill="#1877F2" />
          <span className="text-[8px] text-muted-foreground">142</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <ThumbsUp className="w-3 h-3" />
          <MessageCircle className="w-3 h-3" />
          <Share2 className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

const DesktopPreview = ({ creative, title, headline, cta }: PreviewProps) => {
  if (!creative) return null;
  
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden shadow-md">
      {/* Header */}
      <div className="p-2.5 flex items-center gap-2 border-b border-border/50">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70" />
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-foreground">Your Business</p>
          <p className="text-[9px] text-muted-foreground">Sponsored · 🌐</p>
        </div>
        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      {/* Text */}
      <div className="px-2.5 py-1.5">
        <p className="text-[11px] text-foreground line-clamp-2">{headline}</p>
      </div>

      {/* Creative */}
      <div className="relative aspect-video">
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-muted-foreground uppercase">yourstore.com</p>
            <p className="text-[11px] font-semibold text-foreground truncate">{title}</p>
          </div>
          <button className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded flex-shrink-0">
            {cta}
          </button>
        </div>
      </div>

      {/* Engagement */}
      <div className="px-2.5 py-1.5 flex items-center justify-between border-t border-border/50">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-0.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#1877F2] flex items-center justify-center">
              <ThumbsUp className="w-1.5 h-1.5 text-white" fill="white" />
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center">
              <Heart className="w-1.5 h-1.5 text-white" fill="white" />
            </div>
          </div>
          <span className="text-[9px] text-muted-foreground">142</span>
        </div>
        <span className="text-[9px] text-muted-foreground">12 comments</span>
      </div>
    </div>
  );
};
