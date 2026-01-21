import { CampaignDraft, campaignObjectiveOptions } from '@/types/multiCampaign';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  Check, 
  Plus,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CampaignSwitcherProps {
  campaigns: CampaignDraft[];
  activeCampaignId: string | null;
  onSelectCampaign: (campaignId: string) => void;
  onAddCampaign: () => void;
}

export const CampaignSwitcher = ({
  campaigns,
  activeCampaignId,
  onSelectCampaign,
  onAddCampaign
}: CampaignSwitcherProps) => {
  const activeCampaign = campaigns.find(c => c.id === activeCampaignId);
  const activeObjective = activeCampaign 
    ? campaignObjectiveOptions.find(o => 
        o.name.toLowerCase() === activeCampaign.objective.toLowerCase() || 
        o.id === activeCampaign.objective.toLowerCase()
      )
    : null;

  if (campaigns.length <= 1 && !activeCampaign) {
    return null;
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-muted',
    configuring: 'bg-amber-500',
    ready: 'bg-emerald-500',
    published: 'bg-primary'
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-muted/30">
      <Layers className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Campaign:</span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-2">
            <span className="text-lg">{activeObjective?.icon || '🎯'}</span>
            <span className="font-medium text-sm truncate max-w-[150px]">
              {activeCampaign?.name || 'Select Campaign'}
            </span>
            <div className={cn(
              "w-2 h-2 rounded-full",
              statusColors[activeCampaign?.status || 'draft']
            )} />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {campaigns.map((campaign) => {
            const objective = campaignObjectiveOptions.find(o => 
              o.name.toLowerCase() === campaign.objective.toLowerCase() || 
              o.id === campaign.objective.toLowerCase()
            );
            const isActive = campaign.id === activeCampaignId;
            
            return (
              <DropdownMenuItem
                key={campaign.id}
                onClick={() => onSelectCampaign(campaign.id)}
                className="flex items-center gap-3 py-2"
              >
                <span className="text-lg">{objective?.icon || '🎯'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{campaign.name}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {objective?.name || campaign.objective}
                  </span>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  statusColors[campaign.status]
                )} />
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onAddCampaign} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Another Campaign</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Badge variant="secondary" className="text-[10px] ml-auto">
        {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
      </Badge>
    </div>
  );
};
