import { 
  Hand, 
  Video, 
  Camera, 
  Share2, 
  Package, 
  Sparkles,
  Clock,
  Image,
  Film
} from 'lucide-react';
import { CreateTemplate } from '@/types/create';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: CreateTemplate;
  onSelect: (templateId: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  hand: Hand,
  video: Video,
  camera: Camera,
  share: Share2,
  package: Package,
  sparkles: Sparkles,
};

export const TemplateCard = ({ template, onSelect }: TemplateCardProps) => {
  const IconComponent = iconMap[template.icon] || Sparkles;
  const isVideo = template.outputType === 'video';

  return (
    <button
      onClick={() => onSelect(template.id)}
      className={cn(
        "group relative flex flex-col items-center p-6 rounded-2xl",
        "bg-card border border-border",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      )}
    >
      {/* Output type badge */}
      <div className="absolute top-3 right-3">
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          isVideo 
            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" 
            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
        )}>
          {isVideo ? <Film className="w-3 h-3" /> : <Image className="w-3 h-3" />}
          {isVideo ? 'Video' : 'Image'}
        </div>
      </div>

      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
        "bg-primary/10 text-primary",
        "group-hover:bg-primary group-hover:text-primary-foreground",
        "transition-all duration-300"
      )}>
        <IconComponent className="w-7 h-7" />
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold text-foreground mb-1">
        {template.name}
      </h3>
      <p className="text-sm text-muted-foreground text-center leading-relaxed mb-3">
        {template.description}
      </p>

      {/* Estimated time */}
      {template.estimatedTime && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {template.estimatedTime}
        </div>
      )}

      {/* Hover indicator */}
      <div className={cn(
        "absolute inset-0 rounded-2xl border-2 border-primary opacity-0",
        "group-hover:opacity-100 transition-opacity duration-300",
        "pointer-events-none"
      )} />
    </button>
  );
};
