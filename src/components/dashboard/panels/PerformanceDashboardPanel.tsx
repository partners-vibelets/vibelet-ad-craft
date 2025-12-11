import { useEffect, useRef } from 'react';
import { PerformanceDashboardState, PublishedCampaign } from '@/types/campaign';
import { MetricsGrid } from '../performance/MetricsGrid';
import { AIActionsPreview } from '../performance/AIActionsPreview';
import { CampaignFilter } from '../performance/CampaignFilter';
import { CampaignLifecycleMeter } from '../performance/CampaignLifecycleMeter';
import { WhatChangedWidget } from '../performance/WhatChangedWidget';
import { AIActionCenter } from '../performance/AIActionCenter';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, RefreshCw } from 'lucide-react';

interface PerformanceDashboardPanelProps {
  dashboard: PerformanceDashboardState;
  isRefreshing?: boolean;
  onCampaignFilterChange: (campaignId: string | null) => void;
  onOpenActionCenter: () => void;
  onCloseActionCenter: () => void;
  onRecommendationAction: (recommendationId: string, action: string, value?: number) => void;
  onCreateAnother: () => void;
  onRefresh?: () => void;
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
  onRefresh
}: PerformanceDashboardPanelProps) => {
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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

  // For "All Campaigns" view, aggregate changes from all campaigns
  const aggregatedChanges = selectedCampaign 
    ? selectedCampaign.changes 
    : dashboard.publishedCampaigns.flatMap(c => c.changes);

  // Lifecycle data from selected campaign or default for "All Campaigns"
  const lifecycleStage = selectedCampaign?.lifecycleStage || 'optimizing';
  const stageProgress = selectedCampaign?.stageProgress || 60;
  const stageDescription = selectedCampaign?.stageDescription || 'Your campaigns are being optimized by AI for best performance';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Campaign Performance</h2>
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
      </div>

      {/* Unified Section: Metrics + AI Actions */}
      <MetricsGrid metrics={dashboard.unifiedMetrics} isRefreshing={isRefreshing} />
      
      <AIActionsPreview 
        recommendations={dashboard.recommendations}
        onViewAll={onOpenActionCenter}
      />

      {/* Separator */}
      <div className="mx-4 border-t border-border/50" />

      {/* Campaign-Specific Section */}
      <CampaignFilter
        campaigns={dashboard.publishedCampaigns}
        selectedCampaignId={dashboard.selectedCampaignId}
        onSelect={onCampaignFilterChange}
      />

      <CampaignLifecycleMeter
        stage={lifecycleStage}
        progress={stageProgress}
        description={stageDescription}
      />

      <WhatChangedWidget changes={aggregatedChanges} />

      {/* AI Action Center Slide-over */}
      <AIActionCenter
        isOpen={dashboard.isActionCenterOpen}
        onClose={onCloseActionCenter}
        recommendations={dashboard.recommendations}
        campaigns={dashboard.publishedCampaigns}
        onAction={onRecommendationAction}
      />
    </div>
  );
};
