import { CampaignState, CampaignStep } from '@/types/campaign';
import { WelcomePanel } from './panels/WelcomePanel';
import { ProductAnalysisPanel } from './panels/ProductAnalysisPanel';
import { ScriptSelectionPanel } from './panels/ScriptSelectionPanel';
import { AvatarSelectionPanel } from './panels/AvatarSelectionPanel';
import { CreativeGenerationPanel } from './panels/CreativeGenerationPanel';
import { CreativeReviewPanel } from './panels/CreativeReviewPanel';
import { CampaignSetupPanel } from './panels/CampaignSetupPanel';
import { FacebookIntegrationPanel } from './panels/FacebookIntegrationPanel';
import { AdAccountSelectionPanel } from './panels/AdAccountSelectionPanel';
import { CampaignPreviewPanel } from './panels/CampaignPreviewPanel';
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
  onSelectScript,
  onSelectAvatar,
  onSelectCreative,
  onCampaignSetup,
  onConnectFacebook,
  onSelectAdAccount,
  onPublish,
  onReset,
  onStepClick,
}: RightPanelProps) => {
  const renderPanel = () => {
    switch (state.step) {
      case 'welcome':
      case 'product-url':
        return <WelcomePanel />;
      
      case 'product-analysis':
        return <ProductAnalysisPanel productData={state.productData} productUrl={state.productUrl} isAnalyzing={!state.productData} />;
      
      case 'script-selection':
        return (
          <>
            <ProductAnalysisPanel productData={state.productData} productUrl={state.productUrl} isAnalyzing={false} />
            <div className="border-t border-border">
              <ScriptSelectionPanel selectedScript={state.selectedScript} onSelect={onSelectScript} />
            </div>
          </>
        );
      
      case 'avatar-selection':
        return <AvatarSelectionPanel selectedAvatar={state.selectedAvatar} onSelect={onSelectAvatar} />;
      
      case 'creative-generation':
        return <CreativeGenerationPanel />;
      
      case 'creative-review':
        return <CreativeReviewPanel creatives={state.creatives} selectedCreative={state.selectedCreative} onSelect={onSelectCreative} />;
      
      case 'campaign-setup':
        return <CampaignSetupPanel onSubmit={onCampaignSetup} />;
      
      case 'facebook-integration':
        return <FacebookIntegrationPanel isConnected={state.facebookConnected} onConnect={onConnectFacebook} />;
      
      case 'ad-account-selection':
        return <AdAccountSelectionPanel selectedAccount={state.selectedAdAccount} onSelect={onSelectAdAccount} />;
      
      case 'campaign-preview':
        return <CampaignPreviewPanel state={state} onPublish={onPublish} />;
      
      case 'publishing':
      case 'published':
        return <PublishingPanel isPublished={state.step === 'published'} onCreateAnother={onReset} />;
      
      default:
        return <WelcomePanel />;
    }
  };

  const showStepIndicator = state.step !== 'welcome' && state.step !== 'product-url';

  return (
    <div className="h-full bg-background flex flex-col">
      {showStepIndicator && (
        <StepIndicator currentStep={state.step} onStepClick={onStepClick} />
      )}
      <ScrollArea className="flex-1">
        {renderPanel()}
      </ScrollArea>
    </div>
  );
};
