import { AIRecommendation, PublishedCampaign } from '@/types/campaign';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { BudgetAdjustmentCard } from './recommendations/BudgetAdjustmentCard';
import { CreativeActionCard } from './recommendations/CreativeActionCard';
import { ResumeCampaignCard } from './recommendations/ResumeCampaignCard';
import { cn } from '@/lib/utils';

interface AIActionCenterProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: AIRecommendation[];
  campaigns: PublishedCampaign[];
  onAction: (recommendationId: string, action: string, value?: number) => void;
}

type PriorityFilter = 'all' | 'high' | 'medium' | 'suggestion';

export const AIActionCenter = ({
  isOpen,
  onClose,
  recommendations,
  campaigns,
  onAction
}: AIActionCenterProps) => {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  const filteredRecommendations = recommendations.filter(rec => {
    if (priorityFilter !== 'all' && rec.priority !== priorityFilter) return false;
    if (campaignFilter !== 'all' && rec.campaignId !== campaignFilter) return false;
    return true;
  });

  const renderRecommendationCard = (rec: AIRecommendation) => {
    switch (rec.type) {
      case 'budget-increase':
      case 'budget-decrease':
        return (
          <BudgetAdjustmentCard
            key={rec.id}
            recommendation={rec}
            onAction={onAction}
          />
        );
      case 'pause-creative':
      case 'clone-creative':
        return (
          <CreativeActionCard
            key={rec.id}
            recommendation={rec}
            onAction={onAction}
          />
        );
      case 'resume-campaign':
        return (
          <ResumeCampaignCard
            key={rec.id}
            recommendation={rec}
            onAction={onAction}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:w-[480px] p-0">
        <SheetHeader className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-secondary" />
              </div>
              <SheetTitle>AI Recommendations</SheetTitle>
              <Badge variant="secondary" className="ml-2">
                {recommendations.length}
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}>
              <SelectTrigger className="flex-1 h-8 text-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="suggestion">Suggestions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="flex-1 h-8 text-xs">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border">
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-160px)]">
          <div className="p-4 space-y-4">
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recommendations match your filters</p>
              </div>
            ) : (
              filteredRecommendations.map(renderRecommendationCard)
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
