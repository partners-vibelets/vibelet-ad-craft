import { CampaignConfig, CreativeOption, AdAccount } from '@/types/campaign';
import { Settings, Target, DollarSign, MousePointer, Calendar, Facebook, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignConfigPanelProps {
  selectedCreative: CreativeOption | null;
  campaignConfig: CampaignConfig | null;
  facebookConnected: boolean;
  selectedAdAccount: AdAccount | null;
}

export const CampaignConfigPanel = ({ 
  selectedCreative, 
  campaignConfig,
  facebookConnected,
  selectedAdAccount 
}: CampaignConfigPanelProps) => {
  const configItems = [
    { 
      label: 'Objective', 
      value: campaignConfig?.objective, 
      icon: Target,
      pending: !campaignConfig?.objective
    },
    { 
      label: 'Call-to-Action', 
      value: campaignConfig?.cta, 
      icon: MousePointer,
      pending: !campaignConfig?.cta
    },
    { 
      label: 'Daily Budget', 
      value: campaignConfig?.budget ? `$${campaignConfig.budget}/day` : undefined, 
      icon: DollarSign,
      pending: !campaignConfig?.budget
    },
    { 
      label: 'Duration', 
      value: campaignConfig?.duration, 
      icon: Calendar,
      pending: !campaignConfig?.duration
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Campaign Setup</h2>
        <p className="text-sm text-muted-foreground">
          Configure your campaign settings
        </p>
      </div>

      {/* Selected Creative Preview */}
      {selectedCreative && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="aspect-video relative">
            <img 
              src={selectedCreative.thumbnail} 
              alt={selectedCreative.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 bg-card flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{selectedCreative.name}</span>
          </div>
        </div>
      )}

      {/* Configuration Items */}
      <div className="space-y-3">
        {configItems.map((item) => (
          <div 
            key={item.label}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              item.value ? "border-border bg-card" : "border-dashed border-border/50 bg-muted/30"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              item.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <item.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <p className={cn(
                "text-sm font-medium",
                item.value ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.value || 'Pending...'}
              </p>
            </div>
            {item.value && <Check className="w-4 h-4 text-primary" />}
          </div>
        ))}
      </div>

      {/* Facebook Connection */}
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        facebookConnected ? "border-border bg-card" : "border-dashed border-border/50 bg-muted/30"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          facebookConnected ? "bg-[#1877F2]/10 text-[#1877F2]" : "bg-muted text-muted-foreground"
        )}>
          <Facebook className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="text-xs text-muted-foreground">Facebook Ads</span>
          <p className={cn(
            "text-sm font-medium",
            facebookConnected ? "text-foreground" : "text-muted-foreground"
          )}>
            {facebookConnected 
              ? selectedAdAccount?.name || 'Connected' 
              : 'Not connected'}
          </p>
        </div>
        {facebookConnected && <Check className="w-4 h-4 text-primary" />}
      </div>
    </div>
  );
};
