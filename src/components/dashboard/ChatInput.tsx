import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, disabled, placeholder }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Paste your product URL or type a message..."}
            disabled={disabled}
            className="min-h-[60px] max-h-[200px] resize-none pr-12 bg-muted/50 border-muted-foreground/20"
            rows={2}
          />
          <div className="absolute right-2 bottom-2">
            <Sparkles className="w-4 h-4 text-primary/50" />
          </div>
        </div>
        <Button 
          onClick={handleSend} 
          disabled={disabled || !input.trim()}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Powered by Vibelets AI • Your data is secure and private
      </p>
    </div>
  );
};
