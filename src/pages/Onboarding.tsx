import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Gift, 
  Check, 
  ArrowRight, 
  Zap,
  Palette,
  Rocket
} from 'lucide-react';
import vibeLogo from '@/assets/vibelets-logo-unified.png';

type OnboardingStep = 'welcome' | 'credits' | 'ready';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding, claimBonusCredits, isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user?.hasCompletedOnboarding) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleNextStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (step === 'welcome') setStep('credits');
      else if (step === 'credits') setStep('ready');
      setIsTransitioning(false);
    }, 300);
  };

  const handleClaimBonus = async () => {
    setIsClaimingBonus(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    claimBonusCredits();
    setBonusClaimed(true);
    setIsClaimingBonus(false);
  };

  const handleComplete = () => {
    completeOnboarding();
    navigate('/dashboard');
  };

  const getProgress = () => {
    if (step === 'welcome') return 33;
    if (step === 'credits') return 66;
    return 100;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-muted z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
          style={{ width: `${getProgress()}%` }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg">
        <div className={cn(
          "glass-panel rounded-3xl p-8 shadow-2xl border border-border/50 transition-all duration-300",
          isTransitioning && "opacity-0 scale-95"
        )}>
          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className="text-center animate-fade-in">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center relative">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-3">
                Welcome to Vibelets
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Your <span className="text-primary font-semibold">Free Forever</span> plan is active, {user.name.split(' ')[0]}!
              </p>

              {/* Plan card */}
              <div className="bg-primary/5 rounded-2xl p-6 mb-8 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-2">Active Plan</p>
                <p className="text-2xl font-bold text-foreground mb-1">Free Forever</p>
                <p className="text-sm text-muted-foreground">5 daily credits • Preview mode</p>
              </div>

              <Button
                size="lg"
                className="w-full h-14 rounded-xl text-lg font-medium group"
                onClick={handleNextStep}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

          {/* Credits Step */}
          {step === 'credits' && (
            <div className="text-center animate-fade-in">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-secondary/30 blur-xl rounded-full animate-pulse" />
                  <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center relative">
                    <Gift className="w-10 h-10 text-secondary" />
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-3">
                Your Credits
              </h1>
              <p className="text-muted-foreground mb-6">
                Credits let you create ad creatives, videos, and campaigns with AI
              </p>

              {/* Credits info card */}
              <div className="bg-muted/50 rounded-2xl p-5 mb-6 text-left space-y-4 border border-border/50">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Daily Credits</span>
                  <span className="font-bold text-foreground">{user.dailyCredits}/day</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Rollover Cap</span>
                  <span className="font-bold text-foreground">{user.rolloverCap} credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Balance</span>
                  <span className="font-bold text-primary">{user.credits} credits</span>
                </div>
              </div>

              {/* Bonus card */}
              <div className="bg-primary/5 rounded-2xl p-5 mb-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground mb-1">Onboarding Bonus</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get 500 bonus credits to start creating
                    </p>
                    <Button
                      className={cn(
                        "w-full h-12 rounded-xl font-medium transition-all",
                        bonusClaimed && "bg-secondary hover:bg-secondary"
                      )}
                      onClick={handleClaimBonus}
                      disabled={isClaimingBonus || bonusClaimed}
                    >
                      {isClaimingBonus ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Claiming...
                        </span>
                      ) : bonusClaimed ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          500 Credits Claimed!
                        </span>
                      ) : (
                        'Claim 500 Credits'
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 rounded-xl text-lg font-medium group"
                onClick={handleNextStep}
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

          {/* Ready Step */}
          {step === 'ready' && (
            <div className="text-center animate-fade-in">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-secondary/30 blur-xl rounded-full animate-pulse" />
                  <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center relative">
                    <Sparkles className="w-10 h-10 text-secondary" />
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-3">
                Ready to Create?
              </h1>
              <p className="text-muted-foreground mb-6">
                Start generating AI-powered ad creatives, videos, and campaigns
              </p>

              {/* Features list */}
              <div className="bg-muted/50 rounded-2xl p-5 mb-8 text-left border border-border/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-foreground">Generate unlimited previews with your credits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-foreground">Test different creative styles and formats</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-foreground">Upgrade anytime to publish live campaigns</span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 rounded-xl text-lg font-medium group mb-3"
                onClick={handleComplete}
              >
                Create First Asset
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="w-full h-12 text-muted-foreground hover:text-foreground"
                onClick={handleComplete}
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Step {step === 'welcome' ? 1 : step === 'credits' ? 2 : 3} of 3
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
