import { CampaignState, CampaignStep } from '@/types/campaign';
import { WelcomePanel } from './panels/WelcomePanel';
import { ProductAnalysisPanel } from './panels/ProductAnalysisPanel';
import { ScriptPreviewPanel } from './panels/ScriptPreviewPanel';
import { AvatarPreviewPanel } from './panels/AvatarPreviewPanel';
import { CreativeGenerationPanel } from './panels/CreativeGenerationPanel';
import { CreativeGalleryPanel } from './panels/CreativeGalleryPanel';
import { CampaignConfigPanel } from './panels/CampaignConfigPanel';
import { CampaignSummaryPanel } from './panels/CampaignSummaryPanel';
import { PublishingPanel } from './panels/PublishingPanel';
import { StepIndicator } from './StepIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { scriptOptions, avatarOptions } from '@/data/mockData';
import { useEffect, useRef } from 'react';

interface RightPanelProps {
  state: CampaignState;
  onReset: () => void;
  onStepClick: (step: CampaignStep) => void;
}

export const RightPanel = ({
  state,
  onReset,
  onStepClick,
}: RightPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [state.step]);

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
            <ScriptPreviewPanel scripts={scriptOptions} selectedScript={state.selectedScript} />
          </>
        );
      
      case 'avatar-selection':
        return (
          <>
            <ProductAnalysisPanel productData={state.productData} productUrl={state.productUrl} isAnalyzing={false} />
            <AvatarPreviewPanel avatars={avatarOptions} selectedAvatar={state.selectedAvatar} />
          </>
        );
      
      case 'creative-generation':
        return <CreativeGenerationPanel />;
      
      case 'creative-review':
        return <CreativeGalleryPanel creatives={state.creatives} selectedCreative={state.selectedCreative} />;
      
      case 'campaign-setup':
      case 'facebook-integration':
      case 'ad-account-selection':
        return (
          <CampaignConfigPanel 
            selectedCreative={state.selectedCreative}
            campaignConfig={state.campaignConfig}
            facebookConnected={state.facebookConnected}
            selectedAdAccount={state.selectedAdAccount}
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
        <div className="flex-shrink-0 bg-background/30 border-b border-border/50 animate-fade-in">
          <StepIndicator currentStep={state.step} onStepClick={onStepClick} />
        </div>
      )}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div key={state.step} className="animate-fade-in">
          {renderPanel()}
        </div>
      </ScrollArea>
    </div>
  );
};
