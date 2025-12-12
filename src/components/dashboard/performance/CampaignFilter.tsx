import { PublishedCampaign } from '@/types/campaign';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CampaignFilterProps {
  campaigns: PublishedCampaign[];
  selectedCampaignId: string | null;
  onSelect: (campaignId: string | null) => void;
  showSelectedLabel?: boolean;
}

const statusColors = {
  active: 'bg-secondary text-secondary-foreground',
  paused: 'bg-muted text-muted-foreground',
  learning: 'bg-primary text-primary-foreground'
};

export const CampaignFilter = ({ campaigns, selectedCampaignId, onSelect, showSelectedLabel }: CampaignFilterProps) => {
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Select
          value={selectedCampaignId || 'all'}
          onValueChange={(value) => onSelect(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full h-9 text-sm bg-muted/50">
            <SelectValue placeholder="Select a campaign" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border">
            <SelectItem value="all" className="text-sm">
              <span className="flex items-center gap-2">
                All Campaigns
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                  {campaigns.length}
                </Badge>
              </span>
            </SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id} className="text-sm">
                <span className="flex items-center gap-2">
                  {campaign.name}
                  <Badge className={cn("text-[10px] h-4 px-1.5", statusColors[campaign.status])}>
                    {campaign.status}
                  </Badge>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {showSelectedLabel && selectedCampaign && (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          Showing: <span className="font-medium text-foreground">{selectedCampaign.name}</span>
        </div>
      )}
    </div>
  );
};
