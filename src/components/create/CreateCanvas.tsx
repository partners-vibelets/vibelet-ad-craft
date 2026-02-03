import { CreateSession, CreateTemplate } from '@/types/create';
import { TemplateGallery } from './TemplateGallery';
import { GenerationPreview } from './GenerationPreview';
import { CreativeResult } from './CreativeResult';
import { InputProgress } from './InputProgress';
import { cn } from '@/lib/utils';

interface CreateCanvasProps {
  session: CreateSession;
  templates: CreateTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onRegenerate: () => void;
}

export const CreateCanvas = ({ 
  session, 
  templates, 
  onSelectTemplate,
  onRegenerate 
}: CreateCanvasProps) => {
  const renderContent = () => {
    switch (session.canvasState) {
      case 'template-selection':
        return (
          <TemplateGallery 
            templates={templates} 
            onSelectTemplate={onSelectTemplate} 
          />
        );
      
      case 'input-collection':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-full max-w-md">
              {session.template && (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      {session.template.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {session.template.description}
                    </p>
                  </div>
                  
                  <InputProgress 
                    template={session.template}
                    collectedInputs={session.collectedInputs}
                  />

                  <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <p className="text-sm text-center text-muted-foreground">
                      Answer the questions in chat to continue. Your creative will appear here once generated.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      
      case 'generating':
        return <GenerationPreview template={session.template} />;
      
      case 'result':
        return (
          <CreativeResult 
            outputs={session.outputs}
            onRegenerate={onRegenerate}
          />
        );
      
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="text-destructive mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {session.error || 'An error occurred during generation.'}
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex-1 h-full",
      "bg-background/50 backdrop-blur-sm",
      "border-l border-border",
      "overflow-hidden"
    )}>
      {renderContent()}
    </div>
  );
};
