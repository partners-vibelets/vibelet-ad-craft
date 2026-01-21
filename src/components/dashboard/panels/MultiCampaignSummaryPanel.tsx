import { memo } from 'react';
import { CampaignState } from '@/types/campaign';
import { CampaignDraft, getObjectiveByName } from '@/types/multiCampaign';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Target, 
  DollarSign, 
  Clock,
  Facebook,
  Sparkles,
  ChevronRight,
  Layers,
  Image as ImageIcon,
  PlayCircle,
  Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiCampaignSummaryPanelProps {
  state: CampaignState;
  onEditCampaign?: (campaignId: string) => void;
  onPublishAll?: () => void;
}

// Compact campaign card for side-by-side view
const CampaignSummaryCard = ({ 
  campaign, 
  isActive,
  onEdit 
}: { 
  campaign: CampaignDraft;
  isActive?: boolean;
  onEdit?: () => void;
}) => {
  const objective = getObjectiveByName(campaign.objective);
  
  const formatCta = (cta: string | undefined) => {
    if (!cta) return 'Shop Now';
    return cta.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getBudgetDisplay = () => {
    if (!campaign.config) return '$50/day';
    const amount = parseFloat(campaign.config.budgetAmount || '50');
    const duration = campaign.config.duration === 'ongoing' ? 0 : parseInt(campaign.config.duration || '14');
    
    if (campaign.config.duration === 'ongoing') {
      return `$${amount}/day`;
    }
    
    const total = amount * duration;
    return `$${total.toLocaleString()}`;
  };

  const getDurationDisplay = () => {
    if (!campaign.config) return '14 days';
    return campaign.config.duration === 'ongoing' ? 'Ongoing' : `${campaign.config.duration} days`;
  };

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-500',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
    pink: 'bg-pink-500/10 border-pink-500/30 text-pink-500',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500'
  };

  return (
    <Card className={cn(
      "flex-shrink-0 w-[280px] transition-all duration-200",
      isActive && "ring-2 ring-primary"
    )}>
      <CardContent className="p-4 space-y-4">
        {/* Header with objective */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 border",
              colorMap[objective?.color || 'emerald']
            )}>
              {objective?.icon || '🎯'}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {campaign.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {objective?.name || campaign.objective}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] shrink-0",
              campaign.status === 'ready' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
            )}
          >
            {campaign.status === 'ready' ? 'Ready' : campaign.status}
          </Badge>
        </div>

        {/* Creative Preview */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          {campaign.selectedCreative?.thumbnail ? (
            <img 
              src={campaign.selectedCreative.thumbnail} 
              alt="Creative preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
            </div>
          )}
          {campaign.selectedCreative?.type === 'video' && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">
              Video
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Budget</p>
              <p className="text-xs font-medium text-foreground truncate">{getBudgetDisplay()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Duration</p>
              <p className="text-xs font-medium text-foreground truncate">{getDurationDisplay()}</p>
            </div>
          </div>
        </div>

        {/* Ad Details */}
        <div className="space-y-2">
          <div className="p-2 rounded-md bg-muted/30">
            <p className="text-[10px] text-muted-foreground mb-1">Primary Text</p>
            <p className="text-xs text-foreground line-clamp-2">
              {campaign.config?.primaryText || 'Check out this amazing product!'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-2 rounded-md bg-muted/30">
              <p className="text-[10px] text-muted-foreground mb-0.5">CTA Button</p>
              <p className="text-xs font-medium text-foreground">{formatCta(campaign.config?.cta)}</p>
            </div>
            <div className="flex-1 p-2 rounded-md bg-muted/30">
              <p className="text-[10px] text-muted-foreground mb-0.5">Variants</p>
              <p className="text-xs font-medium text-foreground">
                {campaign.adStrategy === 'single' ? '1 ad' : `${campaign.selectedVariants.length || 1} ads`}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        {onEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onEdit}
          >
            <Edit2 className="w-3.5 h-3.5 mr-2" />
            Edit Campaign
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const MultiCampaignSummaryPanel = ({ 
  state, 
  onEditCampaign,
  onPublishAll 
}: MultiCampaignSummaryPanelProps) => {
  const { multiCampaign, selectedAdAccount, productData } = state;
  const readyCampaigns = multiCampaign.campaigns.filter(c => c.status === 'ready');
  const totalBudget = readyCampaigns.reduce((sum, c) => {
    if (!c.config) return sum;
    const amount = parseFloat(c.config.budgetAmount || '50');
    const duration = c.config.duration === 'ongoing' ? 30 : parseInt(c.config.duration || '14');
    return sum + (amount * duration);
  }, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Campaign Summary</h2>
            <p className="text-xs text-muted-foreground">
              Review all {readyCampaigns.length} campaigns for {productData?.title || 'your product'}
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Cards - Horizontal Scroll */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Your Campaigns</h3>
          <Badge variant="secondary" className="text-xs">
            {readyCampaigns.length} ready to publish
          </Badge>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4 min-w-max">
            {readyCampaigns.map((campaign) => (
              <CampaignSummaryCard
                key={campaign.id}
                campaign={campaign}
                isActive={campaign.id === multiCampaign.activeCampaignId}
                onEdit={onEditCampaign ? () => onEditCampaign(campaign.id) : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Facebook Account */}
      {selectedAdAccount && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1877F2]/5 border border-[#1877F2]/20">
          <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
            <Facebook className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{selectedAdAccount.name}</p>
            <p className="text-xs text-muted-foreground">Connected Facebook Ad Account</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
        </div>
      )}

      {/* Summary Stats */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{readyCampaigns.length}</p>
              <p className="text-xs text-muted-foreground">Campaigns</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">${totalBudget.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Budget</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {readyCampaigns.reduce((sum, c) => 
                  sum + (c.adStrategy === 'single' ? 1 : c.selectedVariants.length || 1), 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">Total Ads</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">What happens next?</h4>
              <p className="text-xs text-muted-foreground">
                All {readyCampaigns.length} campaigns will be published to Facebook at once. You'll be able to track their 
                performance and get AI-powered recommendations to optimize each one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publish Button */}
      {onPublishAll && (
        <Button
          size="lg"
          className="w-full"
          onClick={onPublishAll}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Publish All {readyCampaigns.length} Campaigns
        </Button>
      )}
    </div>
  );
};

export default memo(MultiCampaignSummaryPanel);
