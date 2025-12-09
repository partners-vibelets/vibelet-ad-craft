import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Shield, Check, Link } from 'lucide-react';

interface FacebookIntegrationPanelProps {
  isConnected: boolean;
  onConnect: () => void;
}

export const FacebookIntegrationPanel = ({ isConnected, onConnect }: FacebookIntegrationPanelProps) => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Connect Facebook Ads</h2>
        <p className="text-sm text-muted-foreground">Link your Facebook account to publish campaigns</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1877F2] flex items-center justify-center mx-auto mb-4">
            <Facebook className="w-8 h-8 text-white" />
          </div>
          
          {!isConnected ? (
            <>
              <h3 className="font-semibold text-foreground mb-2">Connect Your Facebook Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We need access to your Facebook Ads account to publish and manage your campaigns.
              </p>
              <Button onClick={onConnect} className="bg-[#1877F2] hover:bg-[#166FE5]">
                <Facebook className="w-4 h-4 mr-2" />
                Connect with Facebook
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Check className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Facebook Connected</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your account is now linked. Select an ad account to continue.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h4 className="font-medium text-foreground text-sm">What we'll access:</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Link className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Ad Accounts</p>
              <p className="text-xs text-muted-foreground">To create and manage campaigns</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Facebook Pixel</p>
              <p className="text-xs text-muted-foreground">To track conversions and optimize ads</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Your data is secure. We only request permissions necessary for campaign management and never store your Facebook password.
        </p>
      </div>
    </div>
  );
};
