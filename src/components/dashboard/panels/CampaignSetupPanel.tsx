import { useState } from 'react';
import { CampaignConfig } from '@/types/campaign';
import { campaignObjectives, ctaOptions } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, DollarSign, MousePointer, Calendar, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignSetupPanelProps {
  onSubmit: (config: CampaignConfig) => void;
}

export const CampaignSetupPanel = ({ onSubmit }: CampaignSetupPanelProps) => {
  const [objective, setObjective] = useState('');
  const [budget, setBudget] = useState('50');
  const [cta, setCta] = useState('');
  const [duration, setDuration] = useState('7');

  const handleSubmit = () => {
    if (objective && budget && cta) {
      onSubmit({
        objective,
        budget: `$${budget}`,
        cta,
        duration: `${duration} days`
      });
    }
  };

  const isValid = objective && budget && cta;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Campaign Setup</h2>
        <p className="text-sm text-muted-foreground">Configure your campaign settings</p>
      </div>

      {/* Objective */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Campaign Objective
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {campaignObjectives.map((obj) => (
            <Card 
              key={obj.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                objective === obj.id && "border-primary bg-primary/5"
              )}
              onClick={() => setObjective(obj.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground text-sm">{obj.name}</span>
                  {objective === obj.id && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">{obj.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Daily Budget
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="pl-7"
            placeholder="50"
          />
        </div>
        <p className="text-xs text-muted-foreground">Recommended: $20-100/day for testing</p>
      </div>

      {/* CTA */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MousePointer className="w-4 h-4 text-primary" />
          Call to Action
        </Label>
        <Select value={cta} onValueChange={setCta}>
          <SelectTrigger>
            <SelectValue placeholder="Select a CTA" />
          </SelectTrigger>
          <SelectContent>
            {ctaOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Campaign Duration
        </Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 days</SelectItem>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-foreground">
          <span className="font-medium">Estimated reach:</span> 15,000 - 45,000 people
        </p>
        <p className="text-xs text-muted-foreground mt-1">Based on your budget and objective</p>
      </div>

      <Button 
        className="w-full" 
        disabled={!isValid}
        onClick={handleSubmit}
      >
        Continue to Facebook Integration
      </Button>
    </div>
  );
};
