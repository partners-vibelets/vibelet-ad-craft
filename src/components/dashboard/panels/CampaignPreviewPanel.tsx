import { CampaignState } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, Video, Target, DollarSign, Facebook, Rocket, Check } from 'lucide-react';

interface CampaignPreviewPanelProps {
  state: CampaignState;
  onPublish: () => void;
}

export const CampaignPreviewPanel = ({ state, onPublish }: CampaignPreviewPanelProps) => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Campaign Summary</h2>
        <p className="text-sm text-muted-foreground">Review your campaign before publishing</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Package className="w-4 h-4" />
            Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {state.productData?.images[0] && (
              <img 
                src={state.productData.images[0]} 
                alt="Product" 
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-foreground">{state.productData?.title}</h3>
              <p className="text-sm text-primary font-medium">{state.productData?.price}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Video className="w-4 h-4" />
            Creative
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="text-foreground">{state.selectedCreative?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Script Style</span>
            <span className="text-foreground">{state.selectedScript?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Avatar</span>
            <span className="text-foreground">{state.selectedAvatar?.name}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4" />
            Campaign Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Objective</span>
            <span className="text-foreground capitalize">{state.campaignConfig?.objective}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Daily Budget</span>
            <span className="text-foreground">{state.campaignConfig?.budget}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">CTA Button</span>
            <span className="text-foreground">{state.campaignConfig?.cta}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span className="text-foreground">{state.campaignConfig?.duration}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Facebook className="w-4 h-4" />
            Facebook Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ad Account</span>
            <span className="text-foreground">{state.selectedAdAccount?.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-accent">
            <Check className="w-4 h-4" />
            <span>Pixel & Page auto-connected</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Estimated Spend</span>
        </div>
        <p className="text-2xl font-bold text-primary">
          {state.campaignConfig?.budget} × {state.campaignConfig?.duration?.replace(' days', '')} = $
          {parseInt(state.campaignConfig?.budget?.replace('$', '') || '0') * parseInt(state.campaignConfig?.duration?.replace(' days', '') || '0')}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Total campaign budget</p>
      </div>

      <Button className="w-full" size="lg" onClick={onPublish}>
        <Rocket className="w-5 h-5 mr-2" />
        Publish Campaign
      </Button>
    </div>
  );
};
