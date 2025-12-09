import { CampaignState } from '@/types/campaign';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Target, 
  DollarSign, 
  MousePointer, 
  Clock,
  Facebook,
  Play,
  Image,
  User,
  FileText
} from 'lucide-react';

interface CampaignSummaryPanelProps {
  state: CampaignState;
}

export const CampaignSummaryPanel = ({ state }: CampaignSummaryPanelProps) => {
  const { productData, selectedScript, selectedAvatar, selectedCreative, campaignConfig, selectedAdAccount } = state;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Campaign Summary</h2>
          <p className="text-sm text-muted-foreground mt-1">Review before publishing</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Ready to Publish
        </Badge>
      </div>

      {/* Product Info */}
      {productData && (
        <Card className="p-4 border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-primary" />
            </div>
            Product
          </h3>
          <div className="flex gap-3">
            <img 
              src={productData.images[0]} 
              alt={productData.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{productData.title}</p>
              <p className="text-lg font-bold text-primary">{productData.price}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Creative Preview */}
      {selectedCreative && (
        <Card className="overflow-hidden border-border/50">
          <div className="relative aspect-video">
            <img 
              src={selectedCreative.thumbnail} 
              alt={selectedCreative.name}
              className="w-full h-full object-cover"
            />
            {selectedCreative.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                </div>
              </div>
            )}
            <Badge className="absolute top-2 left-2 bg-background/90 text-foreground text-xs">
              {selectedCreative.type === 'video' ? (
                <><Play className="w-3 h-3 mr-1" /> Video</>
              ) : (
                <><Image className="w-3 h-3 mr-1" /> Image</>
              )}
            </Badge>
          </div>
          <div className="p-3 bg-muted/30">
            <p className="text-sm font-medium">{selectedCreative.name}</p>
          </div>
        </Card>
      )}

      {/* Script & Avatar */}
      <div className="grid grid-cols-2 gap-3">
        {selectedScript && (
          <Card className="p-3 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Script</span>
            </div>
            <p className="text-sm font-medium">{selectedScript.name}</p>
          </Card>
        )}
        {selectedAvatar && (
          <Card className="p-3 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Avatar</span>
            </div>
            <p className="text-sm font-medium">{selectedAvatar.name}</p>
          </Card>
        )}
      </div>

      {/* Campaign Settings */}
      {campaignConfig && (
        <Card className="p-4 border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-3">Campaign Settings</h3>
          <div className="grid grid-cols-2 gap-4">
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
                <p className="text-xs text-muted-foreground">Daily Budget</p>
                <p className="text-sm font-medium">${campaignConfig.budget}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">CTA Button</p>
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

      {/* Facebook Integration */}
      {selectedAdAccount && (
        <Card className="p-4 border-border/50 bg-[#1877F2]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{selectedAdAccount.name}</p>
              <p className="text-xs text-muted-foreground">Facebook Ads Account • {selectedAdAccount.status}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
        </Card>
      )}

      {/* Total Budget */}
      {campaignConfig && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated Total</span>
            <span className="text-xl font-bold text-primary">
              ${campaignConfig.duration === 'Ongoing' 
                ? `${campaignConfig.budget}/day` 
                : (parseInt(campaignConfig.budget) * parseInt(campaignConfig.duration)).toLocaleString()
              }
            </span>
          </div>
          {campaignConfig.duration !== 'Ongoing' && (
            <p className="text-xs text-muted-foreground mt-1">
              ${campaignConfig.budget}/day × {campaignConfig.duration}
            </p>
          )}
        </Card>
      )}

      {/* Instructions */}
      <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Select <span className="font-medium text-primary">"Publish Campaign"</span> in the chat to submit for Facebook review
        </p>
      </div>
    </div>
  );
};
