import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check, Sparkles, RefreshCw } from 'lucide-react';

const META_CTA_OPTIONS = [
  'Shop Now', 'Learn More', 'Sign Up', 'Buy Now', 'Add to Cart',
  'Get Offer', 'Order Now', 'Subscribe', 'Download', 'Get Quote',
  'Contact Us', 'Book Now', 'Apply Now', 'Send Message',
];

// Mock AI suggestions for demo
const AI_SUGGESTIONS: Record<string, string[]> = {
  headline: [
    'Spring Into Savings — 30% Off',
    'Your Feet Will Thank You',
    'Walk on Clouds, Pay Less',
  ],
  primaryText: [
    'Meet the shoe that 50,000+ runners swear by. Made from sustainable materials, designed for all-day comfort. Spring sale ends Sunday.',
    'Tired of sore feet? Our eco-friendly sneakers are engineered for cloud-like comfort — now 30% off for a limited time.',
    'Join the movement. Sustainable shoes that perform as good as they feel. Shop the Spring Sale before it\'s gone.',
  ],
  description: [
    'Free shipping over $50',
    'Sustainable comfort, on sale',
    'Limited time · 30% off',
  ],
};

interface CompactAdFieldsProps {
  headline: string;
  primaryText: string;
  cta: string;
  description?: string;
  destinationUrl?: string;
  onUpdate: (field: string, value: string) => void;
}

const AIFieldButton = ({ field, hasValue, onGenerate }: { field: string; hasValue: boolean; onGenerate: (value: string) => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = () => {
    setIsGenerating(true);
    const suggestions = AI_SUGGESTIONS[field] || ['Generated content'];
    const randomPick = suggestions[Math.floor(Math.random() * suggestions.length)];
    setTimeout(() => {
      onGenerate(randomPick);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <button
      onClick={generate}
      disabled={isGenerating}
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium transition-all",
        "text-primary/60 hover:text-primary hover:bg-primary/8",
        isGenerating && "animate-pulse pointer-events-none"
      )}
      title={hasValue ? 'Regenerate with AI' : 'Auto-generate with AI'}
    >
      {isGenerating ? (
        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
      ) : (
        <Sparkles className="w-2.5 h-2.5" />
      )}
      {hasValue ? 'Regenerate' : 'Generate'}
    </button>
  );
};

export const CompactAdFields = ({ headline, primaryText, cta, description, onUpdate }: CompactAdFieldsProps) => {
  return (
    <div className="space-y-3">
      {/* Headline */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Headline</label>
          <AIFieldButton field="headline" hasValue={!!headline} onGenerate={(v) => onUpdate('headline', v)} />
        </div>
        <div className="relative">
          <input
            type="text"
            value={headline}
            onChange={e => onUpdate('headline', e.target.value.slice(0, 40))}
            placeholder="Your ad headline..."
            className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40 transition-all"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/40 tabular-nums">{headline.length}/40</span>
        </div>
      </div>

      {/* Primary Text + CTA row */}
      <div className="grid grid-cols-[1fr_140px] gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Primary Text</label>
            <AIFieldButton field="primaryText" hasValue={!!primaryText} onGenerate={(v) => onUpdate('primaryText', v)} />
          </div>
          <div className="relative">
            <textarea
              value={primaryText}
              onChange={e => onUpdate('primaryText', e.target.value.slice(0, 125))}
              placeholder="Ad copy text..."
              rows={2}
              className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-muted-foreground/40 transition-all leading-relaxed"
            />
            <span className="absolute bottom-2 right-2.5 text-[9px] text-muted-foreground/40 tabular-nums">{primaryText.length}/125</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-1">CTA</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between text-[11px] font-medium bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-foreground hover:border-primary/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer">
                <span className="truncate">{cta || 'Select...'}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground/60 shrink-0 ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] max-h-[240px] overflow-y-auto">
              {META_CTA_OPTIONS.map(opt => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => onUpdate('cta', opt)}
                  className={cn("text-[11px] cursor-pointer", cta === opt && "bg-primary/10 text-primary font-medium")}
                >
                  {cta === opt && <Check className="w-3 h-3 mr-1.5 shrink-0" />}
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Description (optional) */}
      {description !== undefined && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Description</label>
            <AIFieldButton field="description" hasValue={!!description} onGenerate={(v) => onUpdate('description', v)} />
          </div>
          <div className="relative">
            <input
              type="text"
              value={description}
              onChange={e => onUpdate('description', e.target.value.slice(0, 30))}
              placeholder="Short description..."
              className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-[12px] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40 transition-all"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/40 tabular-nums">{description.length}/30</span>
          </div>
        </div>
      )}
    </div>
  );
};
