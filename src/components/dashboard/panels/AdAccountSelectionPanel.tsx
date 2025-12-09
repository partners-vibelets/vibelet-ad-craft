import { useState } from 'react';
import { AdAccount } from '@/types/campaign';
import { mockAdAccounts } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Building2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdAccountSelectionPanelProps {
  selectedAccount: AdAccount | null;
  onSelect: (account: AdAccount) => void;
}

export const AdAccountSelectionPanel = ({ selectedAccount: initial, onSelect }: AdAccountSelectionPanelProps) => {
  const [selected, setSelected] = useState<AdAccount | null>(initial);

  const handleContinue = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Select Ad Account</h2>
        <p className="text-sm text-muted-foreground">Choose an ad account for this campaign</p>
      </div>

      <div className="space-y-3">
        {mockAdAccounts.map((account) => (
          <Card 
            key={account.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selected?.id === account.id && "border-primary bg-primary/5",
              account.status === 'Limited' && "opacity-75"
            )}
            onClick={() => setSelected(account)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{account.name}</h3>
                    <p className="text-xs text-muted-foreground">{account.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    account.status === 'Active' 
                      ? "bg-accent/20 text-accent-foreground" 
                      : "bg-destructive/20 text-destructive"
                  )}>
                    {account.status}
                  </span>
                  {selected?.id === account.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
              {account.status === 'Limited' && (
                <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  This account has spending limits
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
        <p className="text-sm text-foreground">
          <span className="font-medium">✓ Auto-detected:</span> Facebook Pixel and Business Page will be automatically linked.
        </p>
      </div>

      <Button 
        className="w-full" 
        disabled={!selected}
        onClick={handleContinue}
      >
        Continue with {selected?.name || 'Selected Account'}
      </Button>
    </div>
  );
};
