import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Target, 
  MousePointer, 
  DollarSign, 
  Calendar, 
  Check, 
  Pencil,
  Layers,
  FileText,
  Link2,
  Facebook,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CampaignConfig } from '@/types/campaign';

interface CampaignSetupFormProps {
  productUrl: string;
  productTitle: string;
  onComplete: (config: CampaignConfig) => void;
  disabled?: boolean;
}

const objectives = [
  { id: 'Sales', label: 'Sales', description: 'Drive purchases and conversions' },
  { id: 'Lead Generation', label: 'Lead Generation', description: 'Collect leads and sign-ups' },
  { id: 'Website Traffic', label: 'Traffic', description: 'Send visitors to your website' },
  { id: 'Brand Awareness', label: 'Awareness', description: 'Reach more people' },
];

const ctaOptions = [
  { id: 'SHOP_NOW', label: 'Shop Now' },
  { id: 'LEARN_MORE', label: 'Learn More' },
  { id: 'SIGN_UP', label: 'Sign Up' },
  { id: 'GET_OFFER', label: 'Get Offer' },
  { id: 'BOOK_NOW', label: 'Book Now' },
  { id: 'CONTACT_US', label: 'Contact Us' },
  { id: 'DOWNLOAD', label: 'Download' },
  { id: 'SUBSCRIBE', label: 'Subscribe' },
];

const objectiveCtaRecommendations: Record<string, string[]> = {
  'Sales': ['SHOP_NOW', 'GET_OFFER'],
  'Lead Generation': ['SIGN_UP', 'CONTACT_US'],
  'Website Traffic': ['LEARN_MORE', 'DOWNLOAD'],
  'Brand Awareness': ['LEARN_MORE', 'SUBSCRIBE'],
};

const budgetTypes = [
  { id: 'daily', label: 'Daily Budget', description: 'Spend a set amount per day' },
  { id: 'lifetime', label: 'Lifetime Budget', description: 'Spend over the campaign duration' },
];

const durationOptions = [
  { id: '7', label: '7 days' },
  { id: '14', label: '14 days' },
  { id: '30', label: '30 days' },
  { id: 'ongoing', label: 'Ongoing (until paused)' },
];

// Mock FB account data - in production this would come from Facebook API
const mockFbPixelId = 'PX-1234567890';
const mockFbPageId = 'PG-9876543210';

export const CampaignSetupForm = ({ productUrl, productTitle, onComplete, disabled }: CampaignSetupFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['campaign', 'adset', 'ad']);
  
  // Generate default campaign name from product title
  const generateCampaignName = (title: string) => {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${title.slice(0, 30)} - ${date}`;
  };

  const [formData, setFormData] = useState<CampaignConfig>({
    // Campaign Level
    campaignName: generateCampaignName(productTitle),
    objective: 'Sales',
    budgetType: 'daily',
    
    // Ad Set Level
    adSetName: generateCampaignName(productTitle),
    budgetAmount: '50',
    duration: '14',
    fbPixelId: mockFbPixelId,
    fbPageId: mockFbPageId,
    
    // Ad Level
    adName: generateCampaignName(productTitle),
    primaryText: `Check out ${productTitle}! Limited time offer.`,
    cta: 'SHOP_NOW',
    websiteUrl: productUrl,
  });

  // Sync adSetName and adName with campaignName when it changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      adSetName: prev.campaignName,
      adName: prev.campaignName,
    }));
  }, [formData.campaignName]);

  const updateField = <K extends keyof CampaignConfig>(field: K, value: CampaignConfig[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const recommendedCtas = objectiveCtaRecommendations[formData.objective] || [];

  const handleSubmit = () => {
    if (disabled) return;
    setIsSubmitted(true);
    onComplete(formData);
  };

  const isFormValid = 
    formData.campaignName.trim() !== '' &&
    formData.objective !== '' &&
    formData.budgetAmount !== '' &&
    formData.primaryText.trim() !== '' &&
    formData.websiteUrl.trim() !== '';

  if (isSubmitted) {
    return (
      <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/5 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Campaign configured!</p>
            <p className="text-xs text-muted-foreground">
              {formData.campaignName} • {formData.objective} • ${formData.budgetAmount}/{formData.budgetType === 'daily' ? 'day' : 'total'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Campaign Configuration</span>
          </div>
          <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-primary/10 text-primary">
            Advantage+ Shopping
          </span>
        </div>

        <Accordion 
          type="multiple" 
          value={expandedSections} 
          onValueChange={setExpandedSections}
          className="divide-y divide-border/50"
        >
          {/* Campaign Level */}
          <AccordionItem value="campaign" className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium">Campaign Level</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <div className="space-y-4">
                {/* Campaign Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="campaignName" className="text-xs text-muted-foreground">
                    Campaign Name
                  </Label>
                  <Input
                    id="campaignName"
                    value={formData.campaignName}
                    onChange={(e) => updateField('campaignName', e.target.value)}
                    placeholder="Enter campaign name"
                    className="h-9 text-sm"
                  />
                </div>

                {/* Objective */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Campaign Objective</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {objectives.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => updateField('objective', obj.id)}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all duration-200",
                          formData.objective === obj.id
                            ? "border-secondary bg-secondary/15 shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <p className="text-xs font-medium text-foreground">{obj.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{obj.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Budget Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {budgetTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => updateField('budgetType', type.id as 'daily' | 'lifetime')}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all duration-200",
                          formData.budgetType === type.id
                            ? "border-secondary bg-secondary/15 shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <p className="text-xs font-medium text-foreground">{type.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ad Set Level */}
          <AccordionItem value="adset" className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary/15 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-secondary" />
                </div>
                <span className="text-sm font-medium">Ad Set Level</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <div className="space-y-4">
                {/* Ad Set Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="adSetName" className="text-xs text-muted-foreground">
                    Ad Set Name
                  </Label>
                  <Input
                    id="adSetName"
                    value={formData.adSetName}
                    onChange={(e) => updateField('adSetName', e.target.value)}
                    placeholder="Enter ad set name"
                    className="h-9 text-sm"
                  />
                </div>

                {/* Budget Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="budgetAmount" className="text-xs text-muted-foreground">
                    Budget Amount ($)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      id="budgetAmount"
                      type="number"
                      value={formData.budgetAmount}
                      onChange={(e) => updateField('budgetAmount', e.target.value)}
                      placeholder="50"
                      className="h-9 text-sm pl-7"
                      min="1"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <Select 
                    value={formData.duration} 
                    onValueChange={(val) => updateField('duration', val)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-sm">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* FB Integration Info */}
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-[#1877F2]" />
                    <span className="text-xs font-medium text-foreground">Facebook Integration</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Pixel ID:</span>
                      <p className="font-mono text-foreground truncate">{formData.fbPixelId}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Page ID:</span>
                      <p className="font-mono text-foreground truncate">{formData.fbPageId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ad Level */}
          <AccordionItem value="ad" className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5 text-accent-foreground" />
                </div>
                <span className="text-sm font-medium">Ad Level</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <div className="space-y-4">
                {/* Ad Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="adName" className="text-xs text-muted-foreground">
                    Ad Name
                  </Label>
                  <Input
                    id="adName"
                    value={formData.adName}
                    onChange={(e) => updateField('adName', e.target.value)}
                    placeholder="Enter ad name"
                    className="h-9 text-sm"
                  />
                </div>

                {/* Primary Text */}
                <div className="space-y-1.5">
                  <Label htmlFor="primaryText" className="text-xs text-muted-foreground">
                    Primary Text
                  </Label>
                  <Textarea
                    id="primaryText"
                    value={formData.primaryText}
                    onChange={(e) => updateField('primaryText', e.target.value)}
                    placeholder="Write your ad copy..."
                    className="min-h-[80px] text-sm resize-none"
                    maxLength={125}
                  />
                  <p className="text-[10px] text-muted-foreground text-right">
                    {formData.primaryText.length}/125 characters
                  </p>
                </div>

                {/* Call-to-Action */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Call-to-Action</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ctaOptions.map((cta) => {
                      const isSelected = formData.cta === cta.id;
                      const isRecommended = recommendedCtas.includes(cta.id);
                      
                      return (
                        <button
                          key={cta.id}
                          onClick={() => updateField('cta', cta.id)}
                          className={cn(
                            "p-2 rounded-lg border text-center transition-all duration-200 relative",
                            isSelected
                              ? "border-secondary bg-secondary/15 shadow-sm"
                              : isRecommended
                              ? "border-secondary/60 bg-secondary/10 shadow-sm"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          {isRecommended && (
                            <span className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-secondary text-[7px] font-semibold text-secondary-foreground glow-badge">
                              <Sparkles className="w-2 h-2" />
                            </span>
                          )}
                          <p className="text-[10px] font-medium text-foreground whitespace-nowrap">{cta.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Website URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="websiteUrl" className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Link2 className="w-3 h-3" />
                    Destination URL
                  </Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => updateField('websiteUrl', e.target.value)}
                    placeholder="https://yourstore.com/product"
                    className="h-9 text-sm font-mono"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Submit Button */}
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <Button
            onClick={handleSubmit}
            disabled={disabled || !isFormValid}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm Campaign Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
