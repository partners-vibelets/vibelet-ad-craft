import { CampaignState } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Video, Target, DollarSign, Facebook, Rocket, Check, ThumbsUp, MessageCircle, Share2, Smartphone, Monitor, Heart } from 'lucide-react';

interface CampaignPreviewPanelProps {
  state: CampaignState;
  onPublish: () => void;
}

export const CampaignPreviewPanel = ({ state, onPublish }: CampaignPreviewPanelProps) => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Campaign Preview</h2>
        <p className="text-sm text-muted-foreground">Review how your ad will appear on Facebook</p>
      </div>

      {/* Facebook Ad Preview */}
      <Tabs defaultValue="mobile" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Mobile
          </TabsTrigger>
          <TabsTrigger value="desktop" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Desktop
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile" className="mt-4">
          <div className="mx-auto max-w-[320px]">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              {/* Facebook Post Header */}
              <div className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {state.productData?.title?.charAt(0) || 'V'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{state.productData?.title?.split(' ').slice(0, 2).join(' ') || 'Your Brand'}</p>
                  <p className="text-xs text-muted-foreground">Sponsored · <Facebook className="w-3 h-3 inline" /></p>
                </div>
              </div>

              {/* Ad Copy */}
              <div className="px-3 pb-2">
                <p className="text-sm text-foreground">
                  {state.selectedScript?.description || 'Check out this amazing product!'} ✨
                </p>
              </div>

              {/* Creative Preview */}
              <div className="relative aspect-square bg-muted">
                {state.selectedCreative?.thumbnail ? (
                  <img 
                    src={state.selectedCreative.thumbnail} 
                    alt="Ad Creative" 
                    className="w-full h-full object-cover"
                  />
                ) : state.productData?.images[0] ? (
                  <img 
                    src={state.productData.images[0]} 
                    alt="Product" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                {state.selectedCreative?.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-primary ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info Bar */}
              <div className="p-3 bg-muted/50 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {state.productData?.title?.split(' ').slice(0, 2).join(' ') || 'yoursite.com'}
                    </p>
                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {state.productData?.title || 'Product Name'}
                    </p>
                    <p className="text-sm text-primary font-medium">{state.productData?.price}</p>
                  </div>
                  <Button size="sm" className="text-xs">
                    {state.campaignConfig?.cta || 'Shop Now'}
                  </Button>
                </div>
              </div>

              {/* Facebook Engagement Bar */}
              <div className="px-3 py-2 border-t border-border">
                <div className="flex items-center justify-between text-muted-foreground">
                  <button className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    Like
                  </button>
                  <button className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Comment
                  </button>
                  <button className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="desktop" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            {/* Facebook Post Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {state.productData?.title?.charAt(0) || 'V'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{state.productData?.title?.split(' ').slice(0, 2).join(' ') || 'Your Brand'}</p>
                <p className="text-sm text-muted-foreground">Sponsored · <Facebook className="w-3.5 h-3.5 inline" /></p>
              </div>
            </div>

            {/* Ad Copy */}
            <div className="px-4 pb-3">
              <p className="text-foreground">
                {state.selectedScript?.description || 'Check out this amazing product!'} ✨
              </p>
            </div>

            {/* Creative Preview */}
            <div className="relative aspect-video bg-muted">
              {state.selectedCreative?.thumbnail ? (
                <img 
                  src={state.selectedCreative.thumbnail} 
                  alt="Ad Creative" 
                  className="w-full h-full object-cover"
                />
              ) : state.productData?.images[0] ? (
                <img 
                  src={state.productData.images[0]} 
                  alt="Product" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              {state.selectedCreative?.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-10 border-b-10 border-l-16 border-transparent border-l-primary ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Product Info Bar */}
            <div className="p-4 bg-muted/50 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {state.productData?.title?.split(' ').slice(0, 2).join(' ') || 'yoursite.com'}
                </p>
                <p className="font-semibold text-foreground">
                  {state.productData?.title || 'Product Name'}
                </p>
                <p className="text-primary font-medium">{state.productData?.price}</p>
              </div>
              <Button>
                {state.campaignConfig?.cta || 'Shop Now'}
              </Button>
            </div>

            {/* Facebook Engagement Bar */}
            <div className="px-4 py-3 border-t border-border flex items-center gap-6">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ThumbsUp className="w-5 h-5" />
                <span className="text-sm">Like</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Comment</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Campaign Details Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Campaign
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Objective</span>
              <span className="text-foreground capitalize">{state.campaignConfig?.objective}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">CTA</span>
              <span className="text-foreground">{state.campaignConfig?.cta}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Daily</span>
              <span className="text-foreground">{state.campaignConfig?.budget}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Duration</span>
              <span className="text-foreground">{state.campaignConfig?.duration}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              Creative
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Type</span>
              <span className="text-foreground">{state.selectedCreative?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avatar</span>
              <span className="text-foreground">{state.selectedAvatar?.name}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Facebook className="w-3.5 h-3.5" />
              Facebook
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Account</span>
              <span className="text-foreground truncate max-w-[80px]">{state.selectedAdAccount?.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-accent">
              <Check className="w-3 h-3" />
              <span>Pixel & Page ready</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Budget */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Campaign Budget</p>
            <p className="text-2xl font-bold text-primary">
              ${parseInt(state.campaignConfig?.budget?.replace('$', '') || '0') * parseInt(state.campaignConfig?.duration?.replace(' days', '') || '0')}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>{state.campaignConfig?.budget}/day</p>
            <p>× {state.campaignConfig?.duration}</p>
          </div>
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={onPublish}>
        <Rocket className="w-5 h-5 mr-2" />
        Publish Campaign
      </Button>
    </div>
  );
};
