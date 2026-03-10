import { useState, useEffect } from 'react';
import { Facebook, Check, Loader2, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectFacebookModalProps {
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
}

type Stage = 'intro' | 'connecting' | 'selecting' | 'done';

const demoAdAccounts = [
  { id: 'acc-1', name: 'Primary Ad Account', pixelId: 'px_987654', pageName: 'My Business Page', currency: 'USD' },
  { id: 'acc-2', name: 'Client — Summer Co.', pixelId: 'px_123456', pageName: 'Summer Style Co.', currency: 'USD' },
];

export const ConnectFacebookModal = ({ open, onClose, onConnected }: ConnectFacebookModalProps) => {
  const [stage, setStage] = useState<Stage>('intro');
  const [selectedAccount, setSelectedAccount] = useState<string>('acc-1');

  useEffect(() => {
    if (!open) setStage('intro');
  }, [open]);

  const handleConnect = () => {
    setStage('connecting');
    setTimeout(() => setStage('selecting'), 2000);
  };

  const handleConfirm = () => {
    setStage('done');
    setTimeout(() => {
      onConnected();
      onClose();
    }, 1500);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card shadow-2xl p-6 space-y-5 animate-fade-in">
        {/* Close */}
        <div className="flex justify-between items-start">
          <div className="w-11 h-11 rounded-xl bg-[#1877F2]/10 flex items-center justify-center">
            <Facebook className="w-6 h-6 text-[#1877F2]" />
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {stage === 'intro' && (
          <>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-foreground">Connect your Facebook account</h2>
              <p className="text-sm text-muted-foreground">We'll securely link your Meta ad account to unlock campaign management, reporting, and publishing.</p>
            </div>
            <div className="space-y-2">
              {['Access ad account data', 'Read & manage campaigns', 'View pixel & page info'].map(item => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={handleConnect} className="w-full py-3 rounded-xl bg-[#1877F2] text-white text-sm font-medium hover:bg-[#166FE5] transition-colors flex items-center justify-center gap-2">
              <Facebook className="w-4 h-4" />
              Continue with Facebook
            </button>
            <p className="text-[10px] text-muted-foreground text-center">This is a prototype simulation — no real OAuth occurs</p>
          </>
        )}

        {stage === 'connecting' && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#1877F2] animate-spin mx-auto" />
            <p className="text-sm text-foreground font-medium">Connecting to Facebook...</p>
            <p className="text-xs text-muted-foreground">Authenticating and fetching ad accounts</p>
          </div>
        )}

        {stage === 'selecting' && (
          <>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-foreground">Select an ad account</h2>
              <p className="text-sm text-muted-foreground">Choose the account to use with Vibelets</p>
            </div>
            <div className="space-y-2">
              {demoAdAccounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc.id)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all",
                    selectedAccount === acc.id
                      ? "border-[#1877F2]/40 bg-[#1877F2]/5"
                      : "border-border/40 bg-card/50 hover:border-border hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{acc.name}</p>
                      <p className="text-[11px] text-muted-foreground">Page: {acc.pageName} · Pixel: {acc.pixelId}</p>
                    </div>
                    {selectedAccount === acc.id && (
                      <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleConfirm} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
              Confirm & Continue
            </button>
          </>
        )}

        {stage === 'done' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-secondary" />
            </div>
            <p className="text-base font-semibold text-foreground">Facebook connected!</p>
            <p className="text-sm text-muted-foreground">Your ad account is now linked. Setting up your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};
