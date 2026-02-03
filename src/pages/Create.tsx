import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateFlow } from '@/hooks/useCreateFlow';
import { CreateChatPanel } from '@/components/create/CreateChatPanel';
import { CreateCanvas } from '@/components/create/CreateCanvas';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const Create = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  const {
    session,
    messages,
    templates,
    currentInputId,
    selectTemplate,
    provideInput,
    skipInput,
    regenerate,
    reset,
    handleUserMessage,
  } = useCreateFlow();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show template chips only when no template is selected
  const showTemplateChips = session.canvasState === 'template-selection';

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - 30% width */}
        <div className={cn(
          "w-[30%] min-w-[350px] max-w-[450px]",
          "border-r border-border",
          "flex flex-col"
        )}>
          <CreateChatPanel
            messages={messages}
            templates={templates}
            onSendMessage={handleUserMessage}
            onSelectTemplate={selectTemplate}
            onProvideInput={provideInput}
            onSkipInput={skipInput}
            onReset={reset}
            showTemplateChips={showTemplateChips}
            currentInputId={currentInputId}
          />
        </div>

        {/* Canvas Panel - 70% width */}
        <div className="flex-1 overflow-hidden">
          <CreateCanvas
            session={session}
            templates={templates}
            onSelectTemplate={selectTemplate}
            onRegenerate={regenerate}
            onProvideInput={provideInput}
            onSkipInput={skipInput}
            currentInputId={currentInputId}
          />
        </div>
      </div>
    </div>
  );
};

export default Create;
