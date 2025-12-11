import { PublishedCampaign } from '@/types/campaign';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CampaignFilterProps {
  campaigns: PublishedCampaign[];
  selectedCampaignId: string | null;
  onSelect: (campaignId: string | null) => void;
}

export const CampaignFilter = ({ campaigns, selectedCampaignId, onSelect }: CampaignFilterProps) => {
  const getStatusColor = (status: PublishedCampaign['status']) => {
    switch (status) {
      case 'active': return 'bg-secondary';
      case 'learning': return 'bg-primary';
      case 'paused': return 'bg-muted-foreground';
    }
  };

  return (
    <div className="px-4 py-3 border-t border-b border-border/50 bg-background/30">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Campaign Details</span>
        <Select 
          value={selectedCampaignId || 'all'} 
          onValueChange={(value) => onSelect(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[200px] h-8 text-sm">
            <SelectValue placeholder="All Campaigns" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border">
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                All Campaigns
              </span>
            </SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                <span className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", getStatusColor(campaign.status))} />
                  {campaign.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
