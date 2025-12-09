import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{ background: 'var(--gradient-glow)' }}
      />
      
      {/* Floating orbs with glass effect */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge with glass effect */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-8 animate-slide-up text-primary">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Ad Automation</span>
          </div>

          {/* Headline */}
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            Launch Ad Campaigns
            <span className="block text-gradient mt-2">
              Without the Complexity
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            Vibelets automates your entire ad workflow—from product specs to creative scripts to campaign launch. Just paste your product URL and let AI do the rest.
          </p>

          {/* CTA buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/dashboard">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl">
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators with glass effect */}
          <div 
            className="mt-16 flex flex-col items-center gap-4 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <p className="text-sm text-muted-foreground">Trusted by marketers at</p>
            <div className="flex items-center gap-8 px-8 py-4 rounded-2xl glass">
              <div className="text-xl font-bold text-foreground/60">Shopify</div>
              <div className="text-xl font-bold text-foreground/60">Meta</div>
              <div className="text-xl font-bold text-foreground/60">TikTok</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;