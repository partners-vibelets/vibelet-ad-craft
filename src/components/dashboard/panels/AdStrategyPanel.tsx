import { AdStrategy, ProductVariant } from '@/types/campaign';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  LayoutGrid, 
  FlaskConical,
  Sparkles,
  Check,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdStrategyPanelProps {
  selectedStrategy: AdStrategy;
  onStrategyChange: (strategy: AdStrategy) => void;
  selectedVariants: ProductVariant[];
}

interface StrategyOption {
  id: AdStrategy;
  name: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  adsGenerated: string;
  recommended?: boolean;
  recommendationReason?: string;
}

export const AdStrategyPanel = ({
  selectedStrategy,
  onStrategyChange,
  selectedVariants
}: AdStrategyPanelProps) => {
  const variantCount = selectedVariants.length;

  const strategies: StrategyOption[] = [
    {
      id: 'single',
      name: 'Single Ad',
      description: 'Create one ad that showcases your product broadly',
      icon: <Layers className="h-5 w-5" />,
      benefits: [
        'Simpler to manage',
        'Lower budget requirement',
        'Best for new advertisers'
      ],
      adsGenerated: '1 ad',
      recommended: variantCount <= 1,
      recommendationReason: variantCount <= 1 ? 'Best for single products' : undefined
    },
    {
      id: 'per-variant',
      name: 'Per-Variant Ads',
      description: 'Create dedicated ads for each selected variant',
      icon: <LayoutGrid className="h-5 w-5" />,
      benefits: [
        'Tailored messaging per variant',
        'Better audience targeting',
        'Higher relevance scores'
      ],
      adsGenerated: `${variantCount} ads`,
      recommended: variantCount >= 2,
      recommendationReason: variantCount >= 2 ? 'Maximize variant visibility' : undefined
    },
    {
      id: 'ab-test',
      name: 'A/B Test',
      description: 'Test different creatives to find winners',
      icon: <FlaskConical className="h-5 w-5" />,
      benefits: [
        'Data-driven optimization',
        'Find best performers',
        'Continuous improvement'
      ],
      adsGenerated: `${variantCount * 2} ads`,
      recommended: false
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Choose Your Ad Strategy</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          You've selected <span className="font-medium text-foreground">{variantCount} variant{variantCount !== 1 ? 's' : ''}</span>. 
          How would you like to create ads for them?
        </p>
      </div>

      {/* Strategy Cards */}
      <div className="space-y-4">
        {strategies.map(strategy => (
          <Card 
            key={strategy.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedStrategy === strategy.id && "ring-2 ring-primary border-primary"
            )}
            onClick={() => onStrategyChange(strategy.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                  selectedStrategy === strategy.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {strategy.icon}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{strategy.name}</h3>
                        {strategy.recommended && (
                          <Badge className="bg-primary/10 text-primary border-0 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {strategy.description}
                      </p>
                    </div>
                    
                    {/* Selection indicator */}
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                      selectedStrategy === strategy.id 
                        ? "bg-primary text-primary-foreground" 
                        : "border-2 border-muted-foreground/30"
                    )}>
                      {selectedStrategy === strategy.id && <Check className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="flex flex-wrap gap-2">
                    {strategy.benefits.map((benefit, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs font-normal">
                        {benefit}
                      </Badge>
                    ))}
                  </div>

                  {/* Result preview */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      This will generate <span className="font-medium text-primary">{strategy.adsGenerated}</span>
                    </span>
                  </div>

                  {/* Recommendation reason */}
                  {strategy.recommendationReason && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {strategy.recommendationReason}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Your Campaign Will Include</p>
              <p className="text-xs text-muted-foreground mt-1">
                {variantCount} variant{variantCount !== 1 ? 's' : ''} × {
                  selectedStrategy === 'single' ? '1 shared ad' :
                  selectedStrategy === 'per-variant' ? '1 ad each' :
                  '2 test ads each'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {selectedStrategy === 'single' ? 1 :
                 selectedStrategy === 'per-variant' ? variantCount :
                 variantCount * 2}
              </p>
              <p className="text-xs text-muted-foreground">Total Ads</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};