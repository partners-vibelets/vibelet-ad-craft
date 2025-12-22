import { useEffect, useRef, useState } from 'react';
import { PerformanceDashboardState, PublishedCampaign, AIRecommendation } from '@/types/campaign';
import { MetricsGrid } from '../performance/MetricsGrid';
import { CampaignFilter } from '../performance/CampaignFilter';
import { CampaignStageAndChanges } from '../performance/CampaignStageAndChanges';
import { InlineRecommendations } from '../performance/InlineRecommendations';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, RefreshCw } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
interface PerformanceDashboardPanelProps {
  dashboard: PerformanceDashboardState;
  isRefreshing?: boolean;
  onCampaignFilterChange: (campaignId: string | null) => void;
  onOpenActionCenter: () => void;
  onCloseActionCenter: () => void;
  onRecommendationAction: (recommendationId: string, action: string, value?: number) => void;
  onCreateAnother: () => void;
  onRefresh?: () => void;
  onCloneCreative?: (recommendation: AIRecommendation) => void;
}

const POLLING_INTERVAL = 30000; // 30 seconds

export const PerformanceDashboardPanel = ({
  dashboard,
  isRefreshing = false,
  onCampaignFilterChange,
  onOpenActionCenter,
  onCloseActionCenter,
  onRecommendationAction,
  onCreateAnother,
  onRefresh,
  onCloneCreative
}: PerformanceDashboardPanelProps) => {
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { notifyNewRecommendations, requestBrowserPermission } = useNotifications();
  
  // Auto-select the latest campaign if none selected
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Request browser notification permission on mount
  useEffect(() => {
    requestBrowserPermission();
  }, [requestBrowserPermission]);

  // Notify when new recommendations arrive
  useEffect(() => {
    notifyNewRecommendations(dashboard.recommendations);
  }, [dashboard.recommendations, notifyNewRecommendations]);
  
  useEffect(() => {
    if (!hasAutoSelected && dashboard.publishedCampaigns.length > 0 && !dashboard.selectedCampaignId) {
      // Sort by createdAt descending and select the latest
      const sortedCampaigns = [...dashboard.publishedCampaigns].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onCampaignFilterChange(sortedCampaigns[0].id);
      setHasAutoSelected(true);
    }
  }, [dashboard.publishedCampaigns, dashboard.selectedCampaignId, hasAutoSelected, onCampaignFilterChange]);

  // Auto-polling every 30 seconds
  useEffect(() => {
    if (onRefresh) {
      pollingRef.current = setInterval(() => {
        onRefresh();
      }, POLLING_INTERVAL);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [onRefresh]);

  const selectedCampaign = dashboard.selectedCampaignId 
    ? dashboard.publishedCampaigns.find(c => c.id === dashboard.selectedCampaignId)
    : null;

  return (
    <div className="animate-fade-in">
      {/* Header - Campaign Performance with New Campaign button */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Live Results</h2>
              <p className="text-sm text-muted-foreground">
                {dashboard.publishedCampaigns.length} active campaign{dashboard.publishedCampaigns.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRefresh}
                disabled={isRefreshing}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            )}
            <Button size="sm" onClick={onCreateAnother}>
              <Plus className="h-4 w-4 mr-1" />
              New Campaign
            </Button>
          </div>
        </div>
        
        {/* Campaign Filter - positioned below header buttons */}
        <div className="mt-4">
          <CampaignFilter
            campaigns={dashboard.publishedCampaigns}
            selectedCampaignId={dashboard.selectedCampaignId}
            onSelect={onCampaignFilterChange}
            showSelectedLabel
          />
        </div>
      </div>

      {/* Compact Metrics */}
      <MetricsGrid metrics={dashboard.unifiedMetrics} isRefreshing={isRefreshing} />

      {/* AI Recommendations - Prominent position, always visible */}
      <div>
        <InlineRecommendations
          recommendations={dashboard.recommendations}
          campaigns={dashboard.publishedCampaigns}
          onAction={onRecommendationAction}
          onCloneCreative={onCloneCreative}
        />
      </div>

      {/* Campaign Details - Always expanded */}
      <div className="px-4 pb-4">
        <CampaignStageAndChanges 
          selectedCampaign={selectedCampaign || null} 
          showGuidance={!dashboard.selectedCampaignId}
        />
      </div>
    </div>
  );
};