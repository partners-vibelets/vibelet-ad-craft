import { CreativeOption, CampaignConfig } from '@/types/campaign';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Image, CheckCircle2, Target, DollarSign, MousePointer, Clock } from 'lucide-react';

interface CreativePreviewPanelProps {
  creatives: CreativeOption[];
  selectedCreative: CreativeOption | null;
  campaignConfig: CampaignConfig | null;
}

export const CreativePreviewPanel = ({ creatives, selectedCreative, campaignConfig }: CreativePreviewPanelProps) => {
  const displayCreative = selectedCreative || creatives[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Creative Preview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedCreative ? 'Your selected creative' : 'Preview of generated creatives'}
        </p>
      </div>

      {/* Main Creative Display */}
      {displayCreative && (
        <Card className="overflow-hidden border-2 border-primary/20">
          <div className="relative aspect-video bg-muted">
            <img 
              src={displayCreative.thumbnail} 
              alt={displayCreative.name}
              className="w-full h-full object-cover"
            />
            {displayCreative.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                </div>
              </div>
            )}
            <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
              {displayCreative.type === 'video' ? (
                <><Play className="w-3 h-3 mr-1" /> Video</>
              ) : (
                <><Image className="w-3 h-3 mr-1" /> Image</>
              )}
            </Badge>
            {selectedCreative && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Selected
              </Badge>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground">{displayCreative.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {displayCreative.type === 'video' ? 'Video advertisement with AI avatar' : 'Static image advertisement'}
            </p>
          </div>
        </Card>
      )}

      {/* Creative Thumbnails */}
      {creatives.length > 1 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">All Creatives</h3>
          <div className="grid grid-cols-4 gap-2">
            {creatives.map((creative) => (
              <div 
                key={creative.id}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedCreative?.id === creative.id 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border/50 opacity-60'
                }`}
              >
                <img 
                  src={creative.thumbnail} 
                  alt={creative.name}
                  className="w-full h-full object-cover"
                />
                {creative.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                )}
                {selectedCreative?.id === creative.id && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Config Summary */}
      {campaignConfig && (
        <Card className="p-4 bg-muted/30 border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-3">Campaign Settings</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Objective</p>
                <p className="text-sm font-medium">{campaignConfig.objective}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="text-sm font-medium">${campaignConfig.budget}/day</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">CTA</p>
                <p className="text-sm font-medium">{campaignConfig.cta}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">{campaignConfig.duration}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tip */}
      <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-primary">Tip:</span> Use the chat to make selections and configure your campaign. The preview will update automatically.
        </p>
      </div>
    </div>
  );
};
