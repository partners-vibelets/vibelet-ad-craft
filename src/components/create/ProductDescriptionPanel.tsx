import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductDescriptionPanelProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  uploadedImageUrl?: string;
}

export const ProductDescriptionPanel = ({ 
  value, 
  onChange, 
  onSubmit,
  uploadedImageUrl 
}: ProductDescriptionPanelProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Tell Us About Your Product
          </h2>
          <p className="text-sm text-muted-foreground">
            This helps us create the perfect script and visuals for your video
          </p>
        </div>

        <div className="flex gap-6">
          {/* Product image preview (if uploaded) */}
          {uploadedImageUrl && (
            <div className="shrink-0">
              <div className="w-32 h-32 rounded-xl overflow-hidden border border-border bg-muted">
                <img
                  src={uploadedImageUrl}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Your product
              </p>
            </div>
          )}

          {/* Description input */}
          <div className="flex-1 space-y-4">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="E.g., Premium wireless earbuds with 24-hour battery life, active noise cancellation, and crystal-clear sound. Perfect for music lovers and professionals who want studio-quality audio on the go."
              className={cn(
                "min-h-[150px] resize-none",
                "placeholder:text-muted-foreground/60"
              )}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {value.length} characters
              </span>
              
              <Button
                onClick={onSubmit}
                disabled={value.trim().length < 10}
              >
                Continue
              </Button>
            </div>

            {/* Helpful tips */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs font-medium text-foreground mb-2">
                Tips for a great description:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• What makes your product unique?</li>
                <li>• Who is it for?</li>
                <li>• What problem does it solve?</li>
                <li>• Key features and benefits</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
