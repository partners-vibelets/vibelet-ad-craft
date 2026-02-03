import { useState, useRef, useEffect } from 'react';
import { Send, Upload, ArrowLeft, SkipForward, Sparkles } from 'lucide-react';
import { CreateMessage, CreateTemplate, CreateInputRequest } from '@/types/create';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface CreateChatPanelProps {
  messages: CreateMessage[];
  templates: CreateTemplate[];
  onSendMessage: (message: string) => void;
  onSelectTemplate: (templateId: string) => void;
  onProvideInput: (inputId: string, value: string | File) => void;
  onSkipInput: (inputId: string) => void;
  onReset: () => void;
  showTemplateChips: boolean;
  currentInputId?: string;
}

export const CreateChatPanel = ({
  messages,
  templates,
  onSendMessage,
  onSelectTemplate,
  onProvideInput,
  onSkipInput,
  onReset,
  showTemplateChips,
  currentInputId,
}: CreateChatPanelProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentInputId === 'product-image') {
      onProvideInput('product-image', file);
    }
  };

  // Get the last message's input request if any
  const lastMessage = messages[messages.length - 1];
  const currentInputRequest = lastMessage?.inputRequest;

  // Determine what quick actions to show based on current input
  const renderQuickActions = () => {
    if (!currentInputId) return null;

    switch (currentInputId) {
      case 'product-image':
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </Button>
          </div>
        );
      
      case 'avatar':
        return (
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground self-center">
              Select an avatar from the panel →
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSkipInput('avatar')}
              className="gap-1 text-muted-foreground"
            >
              <SkipForward className="w-3 h-3" />
              Let AI choose
            </Button>
          </div>
        );
      
      case 'script':
        return (
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground self-center">
              Write or generate a script in the panel →
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSkipInput('script')}
              className="gap-1 text-muted-foreground"
            >
              <SkipForward className="w-3 h-3" />
              Auto-generate
            </Button>
          </div>
        );

      case 'duration':
        return (
          <div className="flex gap-2 flex-wrap">
            {['15 seconds', '30 seconds', '60 seconds'].map((duration) => (
              <button
                key={duration}
                onClick={() => onProvideInput('duration', duration.split(' ')[0])}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium",
                  "bg-muted hover:bg-muted/80 text-foreground",
                  "border border-border hover:border-primary/50",
                  "transition-all duration-200"
                )}
              >
                {duration}
              </button>
            ))}
          </div>
        );
      
      default:
        // For optional inputs, show skip button
        if (currentInputRequest && !currentInputRequest.required) {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSkipInput(currentInputId)}
              className="gap-1 text-muted-foreground"
            >
              <SkipForward className="w-3 h-3" />
              Skip
            </Button>
          );
        }
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="font-semibold text-foreground">Create</h2>
          <p className="text-xs text-muted-foreground">AI-powered creative generation</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {message.role === 'assistant' && (
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Sparkles className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2",
              message.role === 'user'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Show uploaded image preview */}
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

            {message.role === 'user' && (
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  You
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Template chips */}
      {showTemplateChips && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {templates.slice(0, 4).map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium",
                  "bg-muted hover:bg-muted/80 text-foreground",
                  "border border-border hover:border-primary/50",
                  "transition-all duration-200"
                )}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick action buttons based on current input */}
      {!showTemplateChips && (
        <div className="px-4 pb-2">
          {renderQuickActions()}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Text input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              currentInputId === 'product-description' 
                ? "Describe your product..." 
                : currentInputId === 'script'
                ? "Type your script here..."
                : "Type a message..."
            }
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
