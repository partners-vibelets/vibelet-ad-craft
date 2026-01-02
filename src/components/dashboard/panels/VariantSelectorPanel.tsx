import { useState, useMemo } from 'react';
import { ProductVariant } from '@/types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Check, 
  Package, 
  TrendingUp, 
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VariantSelectorPanelProps {
  variants: ProductVariant[];
  selectedVariants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  variantAttributes?: string[];
}

export const VariantSelectorPanel = ({
  variants,
  selectedVariants,
  onVariantsChange,
  variantAttributes = []
}: VariantSelectorPanelProps) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string | null>(null);

  // Get unique values for each attribute
  const attributeValues = useMemo(() => {
    const values: Record<string, string[]> = {};
    variantAttributes.forEach(attr => {
      const uniqueValues = [...new Set(
        variants
          .map(v => v.attributes.find(a => a.name === attr)?.value)
          .filter(Boolean) as string[]
      )];
      values[attr] = uniqueValues;
    });
    return values;
  }, [variants, variantAttributes]);

  // Filter variants based on active filter
  const filteredVariants = useMemo(() => {
    if (!activeFilter || !filterValue) return variants;
    return variants.filter(v => 
      v.attributes.some(a => a.name === activeFilter && a.value === filterValue)
    );
  }, [variants, activeFilter, filterValue]);

  // AI-recommended variants
  const recommendedVariants = useMemo(() => 
    variants.filter(v => v.isRecommended),
    [variants]
  );

  const isSelected = (variant: ProductVariant) => 
    selectedVariants.some(v => v.id === variant.id);

  const toggleVariant = (variant: ProductVariant) => {
    if (isSelected(variant)) {
      onVariantsChange(selectedVariants.filter(v => v.id !== variant.id));
    } else {
      onVariantsChange([...selectedVariants, variant]);
    }
  };

  const selectAll = () => onVariantsChange([...variants]);
  const selectNone = () => onVariantsChange([]);
  const selectRecommended = () => onVariantsChange([...recommendedVariants]);

  const clearFilter = () => {
    setActiveFilter(null);
    setFilterValue(null);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Product Variants Detected</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          I found <span className="font-medium text-foreground">{variants.length} variants</span> for this product. 
          Select which ones you'd like to advertise.
        </p>
      </div>

      {/* AI Recommendation Banner */}
      {recommendedVariants.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">AI Recommendation</p>
                <p className="text-xs text-muted-foreground">
                  Based on your sales data and market trends, I recommend focusing on these {recommendedVariants.length} variants:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recommendedVariants.map(v => (
                    <Badge key={v.id} variant="secondary" className="text-xs">
                      {v.name}
                    </Badge>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={selectRecommended}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Select Recommended
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={selectNone}>
            Clear
          </Button>
        </div>
        
        <div className="h-4 w-px bg-border" />
        
        {/* Attribute Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {variantAttributes.map(attr => (
            <div key={attr} className="relative">
              <select
                className="h-8 px-3 text-xs rounded-md border border-input bg-background cursor-pointer appearance-none pr-8"
                value={activeFilter === attr ? filterValue || '' : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setActiveFilter(attr);
                    setFilterValue(e.target.value);
                  } else {
                    clearFilter();
                  }
                }}
              >
                <option value="">All {attr}s</option>
                {attributeValues[attr]?.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          ))}
          {activeFilter && (
            <Button variant="ghost" size="sm" onClick={clearFilter} className="h-8 px-2">
              <XCircle className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <span>
          <span className="font-medium">{selectedVariants.length}</span> of {variants.length} variants selected
        </span>
      </div>

      {/* Variant Grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {filteredVariants.map(variant => (
            <Card 
              key={variant.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected(variant) && "ring-2 ring-primary border-primary",
                !variant.inStock && "opacity-60"
              )}
              onClick={() => variant.inStock && toggleVariant(variant)}
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  {variant.image ? (
                    <img 
                      src={variant.image} 
                      alt={variant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2">
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                      isSelected(variant) 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background/80 border border-border"
                    )}>
                      {isSelected(variant) && <Check className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {variant.isRecommended && (
                      <Badge className="bg-primary/90 text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    {!variant.inStock && (
                      <Badge variant="secondary" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm leading-tight">{variant.name}</h3>
                    <span className="text-sm font-semibold text-primary whitespace-nowrap">
                      {variant.price}
                    </span>
                  </div>
                  
                  {/* Attributes */}
                  <div className="flex flex-wrap gap-1">
                    {variant.attributes.map(attr => (
                      <Badge 
                        key={`${attr.name}-${attr.value}`} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {attr.value}
                      </Badge>
                    ))}
                  </div>

                  {/* Recommendation Reason */}
                  {variant.recommendationReason && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {variant.recommendationReason}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};