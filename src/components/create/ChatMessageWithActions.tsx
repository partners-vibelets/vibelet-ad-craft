import { useRef } from 'react';
import { Upload, User, Sparkles, ArrowRight } from 'lucide-react';
import { CreateMessage, CreateInputRequest } from '@/types/create';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AVATARS } from '@/data/avatars';

interface ChatMessageWithActionsProps {
  message: CreateMessage;
  onProvideInput: (inputId: string, value: string | File) => void;
  onSkipInput: (inputId: string) => void;
  isLatest: boolean;
}

export const ChatMessageWithActions = ({
  message,
  onProvideInput,
  onSkipInput,
  isLatest,
}: ChatMessageWithActionsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRequest = message.inputRequest;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && inputRequest) {
      onProvideInput(inputRequest.id, file);
    }
  };

  // Render inline action buttons based on input type
  const renderInlineActions = () => {
    if (!inputRequest || !isLatest) return null;

    switch (inputRequest.id) {
      case 'product-image':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Product Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        );

      case 'avatar':
        return (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {AVATARS.slice(0, 4).map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => onProvideInput('avatar', avatar.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
                    "bg-muted/80 hover:bg-primary/10 hover:text-primary",
                    "border border-transparent hover:border-primary/30",
                    "transition-all duration-200 text-xs font-medium"
                  )}
                >
                  <img 
                    src={avatar.imageUrl} 
                    alt={avatar.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  {avatar.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => onSkipInput('avatar')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip – let AI choose the best match
            </button>
          </div>
        );

      case 'script':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onProvideInput('script', 'generate')}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </Button>
            <button
              onClick={() => onSkipInput('script')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Skip
            </button>
          </div>
        );

      case 'duration':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            {['15', '30', '60'].map((dur) => (
              <button
                key={dur}
                onClick={() => onProvideInput('duration', dur)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium",
                  "bg-muted hover:bg-primary/10 hover:text-primary",
                  "border border-transparent hover:border-primary/30",
                  "transition-all duration-200"
                )}
              >
                {dur}s
              </button>
            ))}
          </div>
        );

      default:
        if (!inputRequest.required) {
          return (
            <div className="mt-3">
              <button
                onClick={() => onSkipInput(inputRequest.id)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip this step →
              </button>
            </div>
          );
        }
        return null;
    }
  };

  if (message.role === 'user') {
    return (
      <div className="flex gap-3 justify-end">
        <div className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5",
          "bg-primary text-primary-foreground"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          {message.uploadedImage && (
            <div className="mt-2 rounded-lg overflow-hidden">
              <img 
                src={message.uploadedImage} 
                alt="Uploaded" 
                className="max-w-full h-auto max-h-32 object-cover"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="max-w-[85%]">
        <div className="rounded-2xl px-4 py-2.5 bg-muted text-foreground">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        {renderInlineActions()}
      </div>
    </div>
  );
};
