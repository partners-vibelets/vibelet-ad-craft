import { useState, useRef, useEffect } from 'react';
import { Send, Upload, ArrowLeft, SkipForward } from 'lucide-react';
import { CreateMessage, CreateTemplate, CreateInputRequest } from '@/types/create';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface CreateChatPanelProps {
  messages: CreateMessage[];
  templates: CreateTemplate[];
  onSendMessage: (message: string) => void;
  onSelectTemplate: (templateId: string) => void;
  onProvideInput: (inputId: string, value: string | File) => void;
  onSkipInput: (inputId: string) => void;
  onReset: () => void;
  showTemplateChips: boolean;
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
}: CreateChatPanelProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageInput, setPendingImageInput] = useState<string | null>(null);

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
    if (file && pendingImageInput) {
      onProvideInput(pendingImageInput, file);
      setPendingImageInput(null);
    }
  };

  const handleImageInputClick = (inputId: string) => {
    setPendingImageInput(inputId);
    fileInputRef.current?.click();
  };

  // Get the last message's input request if any
  const lastMessage = messages[messages.length - 1];
  const currentInputRequest = lastMessage?.inputRequest;

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
              <p className="text-sm">{message.content}</p>
              
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

      {/* Input action buttons based on current input request */}
      {currentInputRequest && (
        <div className="px-4 pb-2">
          <div className="flex gap-2">
            {currentInputRequest.type === 'image' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleImageInputClick(currentInputRequest.id)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Image
              </Button>
            )}
            
            {currentInputRequest.type === 'select' && currentInputRequest.options && (
              <div className="flex flex-wrap gap-2">
                {currentInputRequest.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onProvideInput(currentInputRequest.id, option.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium",
                      "bg-muted hover:bg-muted/80 text-foreground",
                      "border border-border hover:border-primary/50",
                      "transition-all duration-200"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {currentInputRequest.type === 'avatar' && currentInputRequest.options && (
              <div className="flex gap-2">
                {currentInputRequest.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onProvideInput(currentInputRequest.id, option.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full",
                      "bg-muted hover:bg-muted/80 text-foreground text-xs font-medium",
                      "border border-border hover:border-primary/50",
                      "transition-all duration-200"
                    )}
                  >
                    {option.preview && (
                      <img 
                        src={option.preview} 
                        alt={option.label}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    )}
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {!currentInputRequest.required && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSkipInput(currentInputRequest.id)}
                className="gap-1 text-muted-foreground"
              >
                <SkipForward className="w-3 h-3" />
                Skip
              </Button>
            )}
          </div>
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
            placeholder="Describe what you want to create..."
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
