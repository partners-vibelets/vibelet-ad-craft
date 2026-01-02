import { useState } from 'react';
import { ProductVariant, CreativeOption, VariantCreativeAssignment } from '@/types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Check, 
  Image as ImageIcon,
  Video,
  Wand2,
  Link2,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreativeAssignmentPanelProps {
  variants: ProductVariant[];
  creatives: CreativeOption[];
  assignments: VariantCreativeAssignment[];
  onAssignmentsChange: (assignments: VariantCreativeAssignment[]) => void;
}

export const CreativeAssignmentPanel = ({
  variants,
  creatives,
  assignments,
  onAssignmentsChange
}: CreativeAssignmentPanelProps) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants[0]?.id || null
  );

  const getAssignedCreatives = (variantId: string): string[] => {
    return assignments.find(a => a.variantId === variantId)?.creativeIds || [];
  };

  const toggleCreativeForVariant = (variantId: string, creativeId: string) => {
    const existingAssignment = assignments.find(a => a.variantId === variantId);
    
    if (existingAssignment) {
      const hasCreative = existingAssignment.creativeIds.includes(creativeId);
      const newCreativeIds = hasCreative
        ? existingAssignment.creativeIds.filter(id => id !== creativeId)
        : [...existingAssignment.creativeIds, creativeId];
      
      onAssignmentsChange(
        assignments.map(a => 
          a.variantId === variantId 
            ? { ...a, creativeIds: newCreativeIds }
            : a
        )
      );
    } else {
      onAssignmentsChange([
        ...assignments,
        { variantId, creativeIds: [creativeId] }
      ]);
    }
  };

  const autoAssign = () => {
    // AI-powered auto-assignment: assign first creative to all variants
    // In real implementation, this would use AI to match creatives to variants
    const autoAssignments: VariantCreativeAssignment[] = variants.map((variant, idx) => ({
      variantId: variant.id,
      creativeIds: [creatives[idx % creatives.length]?.id || creatives[0]?.id].filter(Boolean)
    }));
    onAssignmentsChange(autoAssignments);
  };

  const assignAllToVariant = (variantId: string) => {
    const existingAssignment = assignments.find(a => a.variantId === variantId);
    const allCreativeIds = creatives.map(c => c.id);
    
    if (existingAssignment) {
      onAssignmentsChange(
        assignments.map(a => 
          a.variantId === variantId 
            ? { ...a, creativeIds: allCreativeIds }
            : a
        )
      );
    } else {
      onAssignmentsChange([
        ...assignments,
        { variantId, creativeIds: allCreativeIds }
      ]);
    }
  };

  const clearVariantAssignments = (variantId: string) => {
    onAssignmentsChange(
      assignments.map(a => 
        a.variantId === variantId 
          ? { ...a, creativeIds: [] }
          : a
      )
    );
  };

  const totalAssignments = assignments.reduce(
    (sum, a) => sum + a.creativeIds.length, 
    0
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Assign Creatives to Variants</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose which creatives to use for each variant. You can assign multiple creatives per variant for A/B testing.
        </p>
      </div>

      {/* AI Auto-Assign Button */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wand2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">AI Smart Assignment</p>
                <p className="text-xs text-muted-foreground">
                  Let AI match the best creatives to each variant automatically
                </p>
              </div>
            </div>
            <Button onClick={autoAssign} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Auto-Assign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Assignment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variants List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Variants ({variants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              <div className="p-4 pt-0 space-y-2">
                {variants.map(variant => {
                  const assignedCount = getAssignedCreatives(variant.id).length;
                  const isSelected = selectedVariantId === variant.id;
                  
                  return (
                    <div
                      key={variant.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-primary/10 border border-primary/30" 
                          : "bg-muted/50 hover:bg-muted"
                      )}
                      onClick={() => setSelectedVariantId(variant.id)}
                    >
                      {/* Variant Image */}
                      <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                        {variant.image ? (
                          <img 
                            src={variant.image} 
                            alt={variant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{variant.name}</p>
                        <p className="text-xs text-muted-foreground">{variant.price}</p>
                      </div>

                      {/* Assignment Count */}
                      <Badge 
                        variant={assignedCount > 0 ? "default" : "secondary"}
                        className="flex-shrink-0"
                      >
                        {assignedCount} creative{assignedCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Creatives Assignment */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Creatives ({creatives.length})
              </CardTitle>
              {selectedVariantId && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => assignAllToVariant(selectedVariantId)}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => clearVariantAssignments(selectedVariantId)}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
            {selectedVariantId && (
              <p className="text-xs text-muted-foreground">
                Assigning to: <span className="font-medium text-foreground">
                  {variants.find(v => v.id === selectedVariantId)?.name}
                </span>
              </p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              <div className="p-4 pt-0 grid grid-cols-2 gap-3">
                {creatives.map(creative => {
                  const isAssigned = selectedVariantId 
                    ? getAssignedCreatives(selectedVariantId).includes(creative.id)
                    : false;
                  
                  return (
                    <div
                      key={creative.id}
                      className={cn(
                        "relative rounded-lg overflow-hidden cursor-pointer transition-all",
                        isAssigned && "ring-2 ring-primary",
                        !selectedVariantId && "opacity-50 pointer-events-none"
                      )}
                      onClick={() => selectedVariantId && toggleCreativeForVariant(selectedVariantId, creative.id)}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-square relative">
                        <img 
                          src={creative.thumbnail} 
                          alt={creative.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Type Badge */}
                        <Badge 
                          variant="secondary" 
                          className="absolute bottom-2 left-2 text-xs"
                        >
                          {creative.type === 'video' ? (
                            <><Video className="h-3 w-3 mr-1" /> Video</>
                          ) : (
                            <><ImageIcon className="h-3 w-3 mr-1" /> Image</>
                          )}
                        </Badge>

                        {/* Selection Indicator */}
                        <div className={cn(
                          "absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                          isAssigned 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-background/80 border border-border"
                        )}>
                          {isAssigned && <Check className="h-4 w-4" />}
                        </div>
                      </div>

                      {/* Name */}
                      <div className="p-2 bg-background">
                        <p className="text-xs font-medium truncate">{creative.name}</p>
                        {creative.aspectRatio && (
                          <p className="text-xs text-muted-foreground">{creative.aspectRatio}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Assignment Summary</p>
              <p className="text-xs text-muted-foreground mt-1">
                {variants.filter(v => getAssignedCreatives(v.id).length > 0).length} of {variants.length} variants have creatives assigned
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{totalAssignments}</p>
              <p className="text-xs text-muted-foreground">Total Ads</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};