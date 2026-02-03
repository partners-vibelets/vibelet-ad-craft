import { CreateTemplate } from '@/types/create';
import { TemplateCard } from './TemplateCard';

interface TemplateGalleryProps {
  templates: CreateTemplate[];
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateGallery = ({ templates, onSelectTemplate }: TemplateGalleryProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          What would you like to create?
        </h2>
        <p className="text-muted-foreground">
          Choose a template to get started, or describe anything in the chat
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={onSelectTemplate}
          />
        ))}
      </div>
    </div>
  );
};
