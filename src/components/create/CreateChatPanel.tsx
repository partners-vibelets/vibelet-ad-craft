import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Sparkles } from 'lucide-react';
import { CreateMessage, CreateTemplate } from '@/types/create';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessageWithActions } from './ChatMessageWithActions';
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
        {messages.map((message, index) => (
          <ChatMessageWithActions
            key={message.id}
            message={message}
            onProvideInput={onProvideInput}
            onSkipInput={onSkipInput}
            isLatest={index === messages.length - 1}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Template chips when no template selected */}
      {showTemplateChips && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground mb-2">Quick start:</p>
          <div className="flex flex-wrap gap-2">
            {templates.slice(0, 4).map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template.id)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-medium",
                  "bg-muted/80 hover:bg-primary/10 text-foreground",
                  "border border-border hover:border-primary/50",
                  "transition-all duration-200",
                  "flex items-center gap-2"
                )}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contextual hint based on current input */}
      {!showTemplateChips && currentInputId && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground">
            {currentInputId === 'product-description' && "💡 Type your description below or use the panel on the right"}
            {currentInputId === 'product-image' && "📸 Use the upload button above or drag & drop on the panel"}
            {currentInputId === 'avatar' && "👤 Pick an avatar above or browse all options on the right"}
          </p>
        </div>
      )}

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
