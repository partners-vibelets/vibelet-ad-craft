import { useState } from 'react';
import { CampaignDraft, campaignObjectiveOptions, CampaignObjectiveOption } from '@/types/multiCampaign';
import { ProductData } from '@/types/campaign';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Check, 
  ChevronRight, 
  Sparkles,
  Target,
  Layers,
  Edit2,
  Trash2,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiCampaignHubProps {
  productData: ProductData | null;
  campaigns: CampaignDraft[];
  activeCampaignId: string | null;
  onAddCampaign: (objective: string) => void;
  onSelectCampaign: (campaignId: string) => void;
  onRemoveCampaign: (campaignId: string) => void;
  onContinue: () => void;
}

const ObjectiveCard = ({ 
  objective, 
  isSelected, 
  isUsed,
  onSelect 
}: { 
  objective: CampaignObjectiveOption; 
  isSelected: boolean;
  isUsed: boolean;
  onSelect: () => void;
}) => {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    pink: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
  };

  return (
    <button
      onClick={onSelect}
      disabled={isUsed}
      className={cn(
        "relative p-4 rounded-xl border text-left transition-all duration-200",
        isUsed && "opacity-50 cursor-not-allowed",
        isSelected 
          ? "ring-2 ring-primary border-primary bg-primary/5" 
          : "hover:border-primary/50 hover:bg-muted/50",
        !isSelected && !isUsed && "border-border"
      )}
    >
      {objective.recommended && !isUsed && (
        <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px]">
          <Sparkles className="w-2.5 h-2.5 mr-0.5" />
          Best
        </Badge>
      )}
      
      {isUsed && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 border",
          colorMap[objective.color] || colorMap.emerald
        )}>
          {objective.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground">{objective.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {objective.description}
          </p>
        </div>
      </div>
    </button>
  );
};

const CampaignCard = ({
  campaign,
  isActive,
  onSelect,
  onRemove
}: {
  campaign: CampaignDraft;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) => {
  const objective = campaignObjectiveOptions.find(
    o => o.name.toLowerCase() === campaign.objective.toLowerCase() || o.id === campaign.objective.toLowerCase()
  );
  
  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    configuring: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    ready: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    published: 'bg-primary/10 text-primary border-primary/30'
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isActive && "ring-2 ring-primary border-primary"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
              {objective?.icon || '🎯'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {campaign.name}
                </h4>
                <Badge variant="outline" className={cn("text-[10px] shrink-0", statusColors[campaign.status])}>
                  {campaign.status === 'draft' ? 'Draft' : 
                   campaign.status === 'configuring' ? 'In Progress' :
                   campaign.status === 'ready' ? 'Ready' : 'Published'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {objective?.name || campaign.objective} • {campaign.adStrategy === 'single' ? '1 ad' : `${campaign.selectedVariants.length} variants`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MultiCampaignHub = ({
  productData,
  campaigns,
  activeCampaignId,
  onAddCampaign,
  onSelectCampaign,
  onRemoveCampaign,
  onContinue
}: MultiCampaignHubProps) => {
  const [showObjectivePicker, setShowObjectivePicker] = useState(campaigns.length === 0);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);

  const usedObjectives = campaigns.map(c => c.objective.toLowerCase());
  
  const handleAddCampaign = () => {
    if (selectedObjective) {
      onAddCampaign(selectedObjective);
      setSelectedObjective(null);
      setShowObjectivePicker(false);
    }
  };

  const readyCampaigns = campaigns.filter(c => c.status === 'ready');
  const canPublish = readyCampaigns.length > 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Campaign Hub</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Create multiple campaigns for <span className="font-medium text-foreground">{productData?.title || 'your product'}</span> with different goals
        </p>
      </div>

      {/* Existing Campaigns */}
      {campaigns.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Your Campaigns</h3>
            <Badge variant="secondary" className="text-xs">
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                isActive={campaign.id === activeCampaignId}
                onSelect={() => onSelectCampaign(campaign.id)}
                onRemove={() => onRemoveCampaign(campaign.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add New Campaign Section */}
      {showObjectivePicker ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              {campaigns.length === 0 ? 'Choose Your First Campaign Goal' : 'Add Another Campaign'}
            </h3>
            {campaigns.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowObjectivePicker(false)}
              >
                Cancel
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {campaignObjectiveOptions.map((objective) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                isSelected={selectedObjective === objective.name}
                isUsed={usedObjectives.includes(objective.id) || usedObjectives.includes(objective.name.toLowerCase())}
                onSelect={() => setSelectedObjective(objective.name)}
              />
            ))}
          </div>

          {selectedObjective && (
            <div className="flex gap-3 animate-fade-in">
              <Button
                className="flex-1"
                onClick={handleAddCampaign}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create {selectedObjective} Campaign
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setShowObjectivePicker(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Campaign
        </Button>
      )}

      {/* Pro Tips */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Pro Tip</h4>
              <p className="text-xs text-muted-foreground">
                Running multiple campaigns with different objectives helps you reach customers at every stage of their journey. 
                Start with <span className="text-foreground">Sales</span> to convert ready buyers, then add <span className="text-foreground">Awareness</span> to build your audience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      {canPublish && (
        <div className="pt-4 border-t border-border">
          <Button
            size="lg"
            className="w-full"
            onClick={onContinue}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Continue to Facebook Setup ({readyCampaigns.length} ready)
          </Button>
        </div>
      )}
    </div>
  );
};
