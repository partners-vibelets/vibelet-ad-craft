import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, ArrowRight, Mail, Lock, Eye, EyeOff, ChevronLeft, Check, Shield } from 'lucide-react';
import vibeLogo from '@/assets/vibelets-logo-unified.png';
import { OnboardingQuizModal } from '@/components/workspace/homepage/OnboardingQuizModal';
import { OnboardingAnswers, useUserState } from '@/hooks/useUserState';

type AuthStep = 'method' | 'otp-email' | 'otp-verify' | 'otp-password' | 'onboarding' | 'welcome';

const Auth = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, completeOnboarding } = useAuth();
  const { saveOnboardingAnswers } = useUserState();
  const [step, setStep] = useState<AuthStep>('method');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // OTP flow state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [emailError, setEmailError] = useState('');

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already fully authenticated + onboarded
  useEffect(() => {
    if (isAuthenticated && user?.hasCompletedOnboarding) {
      navigate('/workspace');
    }
  }, [isAuthenticated, user?.hasCompletedOnboarding, navigate]);

  // OTP countdown
  useEffect(() => {
    if (otpCountdown > 0) {
      const t = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpCountdown]);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      await login('google');
      setStep('onboarding');
      setShowOnboarding(true);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setIsLoading('otp-send');
    // Simulate OTP send
    await new Promise(r => setTimeout(r, 1200));
    setOtpSent(true);
    setOtpCountdown(30);
    setStep('otp-verify');
    setIsLoading(null);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    setIsLoading('otp-verify');
    await new Promise(r => setTimeout(r, 1000));
    setOtpVerified(true);
    setStep('otp-password');
    setIsLoading(null);
  };

  const handleCreateAccount = async () => {
    if (password.length < 6) return;
    setIsLoading('create');
    await login('google'); // mock signup
    setStep('onboarding');
    setShowOnboarding(true);
    setIsLoading(null);
  };

  const handleOnboardingComplete = (answers: OnboardingAnswers) => {
    saveOnboardingAnswers(answers);
    completeOnboarding();
    setShowOnboarding(false);
    setStep('welcome');
  };

  const handleOnboardingSkip = () => {
    completeOnboarding();
    setShowOnboarding(false);
    setStep('welcome');
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-destructive', 'bg-amber-400', 'bg-secondary'];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
      </div>

      {/* Onboarding Quiz Modal */}
      {showOnboarding && (
        <OnboardingQuizModal
          open={showOnboarding}
          onClose={handleOnboardingSkip}
          onComplete={handleOnboardingComplete}
        />
      )}

      <div className="relative z-10 w-full max-w-md">
        {/* ========== METHOD SELECTION ========== */}
        {step === 'method' && (
          <div className="rounded-2xl border border-border/50 bg-card shadow-2xl p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <img src={vibeLogo} alt="Vibelets" className="h-9" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Create your account</h1>
                <p className="text-sm text-muted-foreground mt-1">Start creating AI-powered campaigns in minutes</p>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
                <Shield className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-medium text-secondary">Free forever · No credit card</span>
              </div>
            </div>

            {/* Google */}
            <Button
              variant="outline"
              size="lg"
              className="w-full h-13 rounded-xl border-2 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center gap-3 transition-all"
              onClick={handleGoogleLogin}
              disabled={isLoading !== null}
            >
              {isLoading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="font-medium">Continue with Google</span>
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email OTP option */}
            <Button
              variant="ghost"
              size="lg"
              className="w-full h-13 rounded-xl border-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center gap-3 transition-all"
              onClick={() => setStep('otp-email')}
              disabled={isLoading !== null}
            >
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Sign up with email</span>
            </Button>

            {/* Terms */}
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button className="text-primary font-medium hover:underline">Sign in</button>
            </p>
          </div>
        )}

        {/* ========== EMAIL INPUT ========== */}
        {step === 'otp-email' && (
          <div className="rounded-2xl border border-border/50 bg-card shadow-2xl p-8 space-y-5 animate-fade-in">
            <button onClick={() => setStep('method')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">What's your email?</h2>
              <p className="text-sm text-muted-foreground">We'll send you a verification code</p>
            </div>

            <div className="space-y-2">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                className={cn("h-12 rounded-xl text-base", emailError && "border-destructive focus-visible:ring-destructive")}
                onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                autoFocus
              />
              {emailError && <p className="text-xs text-destructive">{emailError}</p>}
            </div>

            <Button
              size="lg"
              className="w-full h-12 rounded-xl"
              onClick={handleSendOtp}
              disabled={!email || isLoading === 'otp-send'}
            >
              {isLoading === 'otp-send' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Send verification code <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        )}

        {/* ========== OTP VERIFY ========== */}
        {step === 'otp-verify' && (
          <div className="rounded-2xl border border-border/50 bg-card shadow-2xl p-8 space-y-5 animate-fade-in">
            <button onClick={() => setStep('otp-email')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Check your inbox</h2>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            {/* OTP inputs */}
            <div className="flex justify-center gap-2.5">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className={cn(
                    "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background transition-all outline-none",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                    digit ? "border-primary/40" : "border-border"
                  )}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <Button
              size="lg"
              className="w-full h-12 rounded-xl"
              onClick={handleVerifyOtp}
              disabled={otp.join('').length !== 6 || isLoading === 'otp-verify'}
            >
              {isLoading === 'otp-verify' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Verify code <Check className="w-4 h-4" /></>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn't receive it?{' '}
              {otpCountdown > 0 ? (
                <span className="text-muted-foreground/60">Resend in {otpCountdown}s</span>
              ) : (
                <button onClick={handleSendOtp} className="text-primary font-medium hover:underline">Resend code</button>
              )}
            </p>
          </div>
        )}

        {/* ========== SET PASSWORD ========== */}
        {step === 'otp-password' && (
          <div className="rounded-2xl border border-border/50 bg-card shadow-2xl p-8 space-y-5 animate-fade-in">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Email verified!</h2>
              <p className="text-sm text-muted-foreground">Now set a password to secure your account</p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 rounded-xl text-base pl-10 pr-10"
                  onKeyDown={e => e.key === 'Enter' && handleCreateAccount()}
                  autoFocus
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(level => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all",
                          passwordStrength >= level ? strengthColors[passwordStrength] : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    "text-xs",
                    passwordStrength === 1 ? "text-destructive" : passwordStrength === 2 ? "text-amber-500" : "text-secondary"
                  )}>
                    {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}
            </div>

            <Button
              size="lg"
              className="w-full h-12 rounded-xl"
              onClick={handleCreateAccount}
              disabled={password.length < 6 || isLoading === 'create'}
            >
              {isLoading === 'create' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">Minimum 6 characters</p>
          </div>
        )}

        {/* ========== WELCOME (post-onboarding) ========== */}
        {step === 'welcome' && (
          <div className="rounded-2xl border border-border/50 bg-card shadow-2xl p-8 space-y-6 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">You're all set! 🎉</h2>
              <p className="text-sm text-muted-foreground">Your workspace is ready. Let's create something amazing.</p>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span>5 free credits</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>AI-powered</span>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full h-12 rounded-xl"
              onClick={() => navigate('/workspace')}
            >
              Enter workspace <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step indicators for OTP flow */}
        {['otp-email', 'otp-verify', 'otp-password'].includes(step) && (
          <div className="flex justify-center gap-1.5 mt-6">
            {['otp-email', 'otp-verify', 'otp-password'].map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 rounded-full transition-all",
                  step === s ? "w-6 bg-primary" : i < ['otp-email', 'otp-verify', 'otp-password'].indexOf(step) ? "w-3 bg-primary/40" : "w-3 bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
