import { useState } from 'react';
import { ProductData } from '@/types/campaign';
import { Loader2, Package, DollarSign, Tag, FileText, Image, TrendingUp, Star, Users, Video, CircleDollarSign, Sparkles, RefreshCw, Target, Zap, Lightbulb, Award, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { cn } from '@/lib/utils';

interface ProductAnalysisPanelProps {
  productData: ProductData | null;
  productUrl: string | null;
  isAnalyzing: boolean;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
}

const insightIcons: Record<string, React.ElementType> = {
  'trending-up': TrendingUp,
  'star': Star,
  'users': Users,
  'video': Video,
  'dollar-sign': CircleDollarSign,
};

const IMAGES_PER_PAGE = 3;

const ProductImageCarousel = ({ images }: { images: string[] }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
  const hasNavigation = images.length > IMAGES_PER_PAGE;
  
  const visibleImages = images.slice(
    currentPage * IMAGES_PER_PAGE,
    (currentPage + 1) * IMAGES_PER_PAGE
  );

  const goToPrev = () => setCurrentPage(p => Math.max(0, p - 1));
  const goToNext = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Image className="w-4 h-4" />
          <span className="text-xs font-medium">Product Images ({images.length})</span>
        </div>
        {hasNavigation && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToPrev}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[40px] text-center">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToNext}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {visibleImages.map((img, i) => (
          <ImageLightbox
            key={currentPage * IMAGES_PER_PAGE + i}
            src={img}
            alt={`Product ${currentPage * IMAGES_PER_PAGE + i + 1}`}
            className="aspect-square rounded-lg bg-muted ring-2 ring-transparent hover:ring-primary/50 transition-all object-cover"
          />
        ))}
      </div>
      {hasNavigation && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentPage === i 
                  ? "bg-primary w-4" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProductAnalysisPanel = ({ productData, productUrl, isAnalyzing, isRegenerating, onRegenerate }: ProductAnalysisPanelProps) => {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col h-full p-6 animate-fade-in">
        {/* Skeleton Product Details */}
        <Card className="border-border mb-4">
          <CardHeader className="pb-3">
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-5 w-20 bg-muted rounded animate-pulse mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="h-3 w-12 bg-muted rounded animate-pulse mb-2" />
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="h-3 w-12 bg-muted rounded animate-pulse mb-2" />
                <div className="h-6 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div>
              <div className="h-3 w-20 bg-muted rounded animate-pulse mb-2" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Analysis Sections */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Analysis Progress */}
        <div className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold text-foreground">Analyzing Your Product</h2>
          <div className="space-y-3">
            {[
              { label: 'Extracting product details', done: true },
              { label: 'Analyzing market position', done: true },
              { label: 'Identifying target audience', done: false },
              { label: 'Generating insights', done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                {item.done ? (
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                ) : (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
                <span className={cn("text-sm", item.done ? "text-foreground" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!productData) return null;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Product Basic Info */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {productData.title}
          </CardTitle>
          <Badge variant="outline" className="w-fit">{productData.category}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Price</span>
              </div>
              <p className="font-bold text-lg text-foreground">{productData.price}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Tag className="w-4 h-4" />
                <span className="text-xs">SKU</span>
              </div>
              <p className="font-bold text-lg text-foreground">{productData.sku}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="text-xs">Description</span>
            </div>
            <p className="text-sm text-foreground">{productData.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Key Highlights */}
      {productData.keyHighlights && productData.keyHighlights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-secondary" />
            Key Highlights
          </h3>
          <div className="flex flex-wrap gap-2">
            {productData.keyHighlights.map((highlight, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="bg-secondary/10 text-secondary border-secondary/20 font-normal"
              >
                {highlight}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Market Position */}
        {productData.marketPosition && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Market Position</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Positioning</span>
                <span className="text-foreground font-medium">{productData.marketPosition.positioning}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Point</span>
                <span className="text-foreground font-medium">{productData.marketPosition.pricePoint}</span>
              </div>
              <div className="pt-1">
                <span className="text-muted-foreground">Value: </span>
                <span className="text-foreground">{productData.marketPosition.valueProposition}</span>
              </div>
            </div>
          </div>
        )}

        {/* Target Audience */}
        {productData.targetAudience && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Target Audience</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="text-foreground font-medium">{productData.targetAudience.primary}</p>
              <p className="text-muted-foreground">{productData.targetAudience.demographics}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {productData.targetAudience.interests.slice(0, 3).map((interest, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 h-5">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Competitive Insight */}
        {productData.competitiveInsight && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Competitive Edge</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="text-foreground">
                <span className="text-secondary font-medium">✓ </span>
                {productData.competitiveInsight.differentiator}
              </p>
              <p className="text-muted-foreground">{productData.competitiveInsight.brandStrength}</p>
              <p className="text-muted-foreground">{productData.competitiveInsight.marketOpportunity}</p>
            </div>
          </div>
        )}

        {/* AI Insights Summary */}
        {productData.insights && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI Analysis</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {productData.insights.slice(0, 4).map((insight, i) => {
                const Icon = insightIcons[insight.icon] || Star;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Icon className="w-3 h-3" />
                      {insight.label}
                    </span>
                    <span className="text-foreground font-medium">{insight.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {productData.recommendations && productData.recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              AI Recommendations
            </h3>
            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={cn("w-3 h-3 mr-1", isRegenerating && "animate-spin")} />
                {isRegenerating ? 'Regenerating...' : 'Refresh'}
              </Button>
            )}
          </div>
          <div className={cn("space-y-2", isRegenerating && "opacity-50")}>
            {productData.recommendations.map((rec, i) => (
              <div 
                key={i} 
                className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-sm"
              >
                <Award className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Images - Moved to end */}
      <ProductImageCarousel images={productData.images} />
    </div>
  );
};
