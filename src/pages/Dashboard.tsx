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
    <div className="h-screen flex bg-background">
      {/* Left Panel - Chat (reduced width) */}
      <div className="w-[380px] min-w-[320px] flex-shrink-0 border-r border-border">
        <ChatPanel
          messages={messages}
          isTyping={isTyping}
          currentStep={state.step}
          onSendMessage={handleUserMessage}
          onQuestionAnswer={handleQuestionAnswer}
          onStepClick={goToStep}
        />
      </div>

      {/* Right Panel - Dynamic Content */}
      <div className="flex-1">
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
        />
      </div>
    </div>
  );
};

export default Dashboard;
