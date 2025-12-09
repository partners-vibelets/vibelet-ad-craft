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
    selectScript,
    selectAvatar,
    selectCreative,
    setCampaignConfig,
    connectFacebook,
    selectAdAccount,
    publishCampaign,
    resetFlow,
    goToStep,
  } = useCampaignFlow();

  return (
    <div className="h-screen flex bg-muted/30 overflow-hidden">
      {/* Left Panel - Chat with glass effect */}
      <div className="w-[380px] max-w-[380px] min-w-[320px] flex-shrink-0 overflow-hidden m-3 mr-0">
        <div className="h-full glass-strong rounded-2xl overflow-hidden shadow-lg">
          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleUserMessage}
            onQuestionAnswer={handleQuestionAnswer}
          />
        </div>
      </div>

      {/* Right Panel - Dynamic Content with glass effect */}
      <div className="flex-1 m-3">
        <div className="h-full glass-card rounded-2xl overflow-hidden shadow-lg">
          <RightPanel
            state={state}
            onSelectScript={selectScript}
            onSelectAvatar={selectAvatar}
            onSelectCreative={selectCreative}
            onCampaignSetup={setCampaignConfig}
            onConnectFacebook={connectFacebook}
            onSelectAdAccount={selectAdAccount}
            onPublish={publishCampaign}
            onReset={resetFlow}
            onStepClick={goToStep}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;