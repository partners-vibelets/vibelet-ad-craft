import { ProductData } from '@/types/campaign';
import { Loader2, Package, DollarSign, Tag, FileText, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductAnalysisPanelProps {
  productData: ProductData | null;
  isAnalyzing: boolean;
}

export const ProductAnalysisPanel = ({ productData, isAnalyzing }: ProductAnalysisPanelProps) => {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Analyzing Your Product</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Extracting product details, images, and specifications from your URL...
        </p>
        <div className="mt-6 space-y-2 w-full max-w-sm">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-muted-foreground text-center">Product Agent working...</p>
        </div>
      </div>
    );
  }

  if (!productData) return null;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Product Analysis Complete</h2>
        <p className="text-sm text-muted-foreground">Here's what I found from your product page</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {productData.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="font-semibold text-foreground">{productData.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="font-semibold text-foreground">{productData.sku}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Description</p>
            </div>
            <p className="text-sm text-foreground">{productData.description}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Product Images ({productData.images.length})</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {productData.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
        <p className="text-sm text-foreground">
          <span className="font-medium">✨ AI Insight:</span> This product is perfect for video ads! The visual features will translate well to short-form content.
        </p>
      </div>
    </div>
  );
};
