import { CampaignState, CampaignStep } from '@/types/campaign';
import { WelcomePanel } from './panels/WelcomePanel';
import { ProductAnalysisPanel } from './panels/ProductAnalysisPanel';
import { CreativeGenerationPanel } from './panels/CreativeGenerationPanel';
import { CreativePreviewPanel } from './panels/CreativePreviewPanel';
import { CampaignSummaryPanel } from './panels/CampaignSummaryPanel';
import { PublishingPanel } from './panels/PublishingPanel';
import { StepIndicator } from './StepIndicator';
import { ScriptOption, AvatarOption, CreativeOption, CampaignConfig, AdAccount } from '@/types/campaign';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RightPanelProps {
  state: CampaignState;
  onSelectScript: (script: ScriptOption) => void;
  onSelectAvatar: (avatar: AvatarOption) => void;
  onSelectCreative: (creative: CreativeOption) => void;
  onCampaignSetup: (config: CampaignConfig) => void;
  onConnectFacebook: () => void;
  onSelectAdAccount: (account: AdAccount) => void;
  onPublish: () => void;
  onReset: () => void;
  onStepClick: (step: CampaignStep) => void;
}

export const RightPanel = ({
  state,
  onReset,
  onStepClick,
}: RightPanelProps) => {
  const renderPanel = () => {
    switch (state.step) {
      case 'welcome':
      case 'product-url':
        return <WelcomePanel />;
      
      case 'product-analysis':
      case 'script-selection':
      case 'avatar-selection':
        return <ProductAnalysisPanel productData={state.productData} productUrl={state.productUrl} isAnalyzing={!state.productData} />;
      
      case 'creative-generation':
        return <CreativeGenerationPanel />;
      
      case 'creative-review':
      case 'campaign-setup':
      case 'facebook-integration':
      case 'ad-account-selection':
        return (
          <CreativePreviewPanel 
            creatives={state.creatives} 
            selectedCreative={state.selectedCreative}
            campaignConfig={state.campaignConfig}
          />
        );
      
      case 'campaign-preview':
        return <CampaignSummaryPanel state={state} />;
      
      case 'publishing':
      case 'published':
        return <PublishingPanel isPublished={state.step === 'published'} onCreateAnother={onReset} />;
      
      default:
        return <WelcomePanel />;
    }
  };

  const showStepIndicator = state.step !== 'welcome' && state.step !== 'product-url';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {showStepIndicator && (
        <div className="flex-shrink-0 bg-background/30 border-b border-border/50">
          <StepIndicator currentStep={state.step} onStepClick={onStepClick} />
        </div>
      )}
      <ScrollArea className="flex-1">
        {renderPanel()}
      </ScrollArea>
    </div>
  );
};
