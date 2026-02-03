import { useState } from 'react';
import { CreateSession, CreateTemplate } from '@/types/create';
import { TemplateGallery } from './TemplateGallery';
import { GenerationPreview } from './GenerationPreview';
import { CreativeResult } from './CreativeResult';
import { VideoSetupPanel } from './VideoSetupPanel';
import { cn } from '@/lib/utils';

interface CreateCanvasProps {
  session: CreateSession;
  templates: CreateTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onRegenerate: () => void;
  onProvideInput: (inputId: string, value: string | File) => void;
  onSkipInput: (inputId: string) => void;
  onStartGeneration: () => void;
  currentInputId?: string;
}

export const CreateCanvas = ({ 
  session, 
  templates, 
  onSelectTemplate,
  onRegenerate,
  onProvideInput,
  onSkipInput,
  onStartGeneration,
  currentInputId
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
        // For video templates, show the combined setup panel
        if (session.template?.outputType === 'video') {
          return (
            <VideoSetupPanel
              collectedInputs={session.collectedInputs}
              onProvideInput={onProvideInput}
              onStartGeneration={onStartGeneration}
            />
          );
        }
        
        // For image templates, show simpler input collection
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-full max-w-md text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {session.template?.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {session.template?.description}
              </p>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Use the chat to provide the required information
                </p>
              </div>
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
