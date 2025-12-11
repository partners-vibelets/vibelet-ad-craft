import { ChatPanel } from '@/components/dashboard/ChatPanel';
import { RightPanel } from '@/components/dashboard/RightPanel';
import { useCampaignFlow } from '@/hooks/useCampaignFlow';

const Dashboard = () => {
  const {
    state,
    messages,
    isTyping,
    handleUserMessage,
    handleQuestionAnswer,
    handleCampaignConfigComplete,
    handleFacebookConnect,
    resetFlow,
    goToStep,
    regenerateProductAnalysis,
    regenerateScripts,
    regenerateCreatives,
    handleCustomScriptSubmit,
    handleCustomScriptCancel,
    handleCustomCreativeSubmit,
    handleCustomCreativeCancel,
  } = useCampaignFlow();

  return (
    <div className="h-screen flex bg-muted/30 overflow-hidden">
      {/* Left Panel - Chat with glass effect */}
      <div className="w-[35%] max-w-[500px] min-w-[380px] flex-shrink-0 overflow-hidden m-3 mr-0">
        <div className="h-full glass-strong rounded-2xl overflow-hidden shadow-lg">
          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleUserMessage}
            onQuestionAnswer={handleQuestionAnswer}
            onCampaignConfigComplete={handleCampaignConfigComplete}
            onFacebookConnect={handleFacebookConnect}
            isFacebookConnected={state.facebookConnected}
          />
        </div>
      </div>

      {/* Right Panel - Dynamic Content with glass effect */}
      <div className="flex-1 m-3">
        <div className="h-full glass-card rounded-2xl overflow-hidden shadow-lg">
          <RightPanel
            state={state}
            onReset={resetFlow}
            onStepClick={goToStep}
            onRegenerateProduct={regenerateProductAnalysis}
            onRegenerateScripts={regenerateScripts}
            onRegenerateCreatives={regenerateCreatives}
            onCustomScriptSubmit={handleCustomScriptSubmit}
            onCustomScriptCancel={handleCustomScriptCancel}
            onCustomCreativeSubmit={handleCustomCreativeSubmit}
            onCustomCreativeCancel={handleCustomCreativeCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;