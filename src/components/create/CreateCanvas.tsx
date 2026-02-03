import { useState } from 'react';
import { CreateSession, CreateTemplate, CollectedInput } from '@/types/create';
import { TemplateGallery } from './TemplateGallery';
import { GenerationPreview } from './GenerationPreview';
import { CreativeResult } from './CreativeResult';
import { InputProgress } from './InputProgress';
import { AvatarSelectionPanel } from './AvatarSelectionPanel';
import { ProductImagePanel } from './ProductImagePanel';
import { ProductDescriptionPanel } from './ProductDescriptionPanel';
import { ScriptInputPanel } from './ScriptInputPanel';
import { cn } from '@/lib/utils';

interface CreateCanvasProps {
  session: CreateSession;
  templates: CreateTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onRegenerate: () => void;
  onProvideInput: (inputId: string, value: string | File) => void;
  onSkipInput: (inputId: string) => void;
  currentInputId?: string;
}

export const CreateCanvas = ({ 
  session, 
  templates, 
  onSelectTemplate,
  onRegenerate,
  onProvideInput,
  onSkipInput,
  currentInputId
}: CreateCanvasProps) => {
  const [descriptionValue, setDescriptionValue] = useState('');

  // Get uploaded image URL from collected inputs
  const getCollectedValue = (inputId: string): string | undefined => {
    const input = session.collectedInputs.find(i => i.inputId === inputId);
    if (!input) return undefined;
    if (typeof input.value === 'string') return input.value;
    if (input.value instanceof File) return URL.createObjectURL(input.value);
    return undefined;
  };

  const uploadedImageUrl = getCollectedValue('product-image');
  const productDescription = session.collectedInputs.find(i => i.inputId === 'product-description')?.value as string;

  const renderInputCollectionContent = () => {
    // Show different panels based on current input being collected
    switch (currentInputId) {
      case 'product-image':
        return (
          <ProductImagePanel
            onUpload={(file) => onProvideInput('product-image', file)}
            uploadedImageUrl={uploadedImageUrl}
          />
        );
      
      case 'product-description':
        return (
          <ProductDescriptionPanel
            value={descriptionValue}
            onChange={setDescriptionValue}
            onSubmit={() => {
              onProvideInput('product-description', descriptionValue);
              setDescriptionValue('');
            }}
            uploadedImageUrl={uploadedImageUrl}
          />
        );
      
      case 'avatar':
        return (
          <AvatarSelectionPanel
            onSelectAvatar={(avatarId) => onProvideInput('avatar', avatarId)}
            selectedAvatarId={getCollectedValue('avatar')}
          />
        );
      
      case 'script':
        return (
          <ScriptInputPanel
            onSubmitScript={(script) => onProvideInput('script', script)}
            onSkip={() => onSkipInput('script')}
            productDescription={productDescription}
          />
        );
      
      default:
        // Default input collection view with progress
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
    }
  };

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
        return renderInputCollectionContent();
      
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
