import { ChatPanel } from '@/components/dashboard/ChatPanel';
import { RightPanel } from '@/components/dashboard/RightPanel';
import { useCampaignFlow } from '@/hooks/useCampaignFlow';

const Dashboard = () => {
  const {
    state,
    messages,
    isTyping,
    handleUserMessage,
    selectScript,
    selectAvatar,
    selectCreative,
    setCampaignConfig,
    connectFacebook,
    selectAdAccount,
    publishCampaign,
    resetFlow,
  } = useCampaignFlow();

  return (
    <div className="h-screen flex bg-background">
      {/* Left Panel - Chat */}
      <div className="w-[45%] min-w-[400px] max-w-[600px] flex-shrink-0">
        <ChatPanel
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleUserMessage}
        />
      </div>

      {/* Right Panel - Dynamic Content */}
      <div className="flex-1 border-l border-border">
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
