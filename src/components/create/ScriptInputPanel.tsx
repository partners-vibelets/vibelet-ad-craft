import { useState } from 'react';
import { Wand2, Edit3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ScriptInputPanelProps {
  onSubmitScript: (script: string) => void;
  onSkip: () => void;
  productDescription?: string;
}

export const ScriptInputPanel = ({ 
  onSubmitScript, 
  onSkip,
  productDescription 
}: ScriptInputPanelProps) => {
  const [mode, setMode] = useState<'choose' | 'custom' | 'generating'>('choose');
  const [script, setScript] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');

  const handleGenerateScript = () => {
    setMode('generating');
    
    // Simulate AI script generation
    setTimeout(() => {
      const mockScript = `Hey there! 👋 Let me show you something amazing.

${productDescription || 'This incredible product'} is going to change the way you think about quality and convenience.

Here's what makes it special:
• Premium materials that last
• Designed with you in mind
• Unbeatable value

Don't just take my word for it – see for yourself why thousands of customers love it.

Ready to elevate your everyday? Click the link below and get yours today!`;
      
      setGeneratedScript(mockScript);
      setScript(mockScript);
      setMode('custom');
    }, 2000);
  };

  const handleSubmit = () => {
    if (script.trim()) {
      onSubmitScript(script);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Video Script
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose how you'd like to create your script
          </p>
        </div>

        {mode === 'choose' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Generate option */}
            <button
              onClick={handleGenerateScript}
              className={cn(
                "group p-6 rounded-2xl border border-border",
                "hover:border-primary/50 hover:bg-primary/5",
                "transition-all duration-200",
                "text-left"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Wand2 className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Generate with AI
              </h3>
              <p className="text-sm text-muted-foreground">
                Let AI write a compelling script based on your product
              </p>
            </button>

            {/* Write custom option */}
            <button
              onClick={() => setMode('custom')}
              className={cn(
                "group p-6 rounded-2xl border border-border",
                "hover:border-primary/50 hover:bg-primary/5",
                "transition-all duration-200",
                "text-left"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Edit3 className="w-6 h-6 text-muted-foreground group-hover:text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Write My Own
              </h3>
              <p className="text-sm text-muted-foreground">
                Have your own script? Enter it here
              </p>
            </button>
          </div>
        )}

        {mode === 'generating' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="w-12 h-12 text-primary/30" />
              </div>
              <Sparkles className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <p className="mt-6 text-muted-foreground">
              Crafting your perfect script...
            </p>
          </div>
        )}

        {mode === 'custom' && (
          <div className="space-y-4">
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Enter your video script here..."
              className="min-h-[250px] resize-none"
            />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {script.length} characters
              </span>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleGenerateScript}
                  className="gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Regenerate
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!script.trim()}
                >
                  Use This Script
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Skip option */}
        <div className="mt-8 text-center">
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip – let AI create a script automatically
          </button>
        </div>
      </div>
    </div>
  );
};
