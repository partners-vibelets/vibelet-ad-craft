import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ background: 'var(--gradient-glow)' }}
      />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Ad Automation</span>
          </div>

          {/* Headline */}
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            Launch Ad Campaigns
            <span 
              className="block bg-clip-text text-transparent mt-2"
              style={{ backgroundImage: 'var(--gradient-hero)' }}
            >
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

          {/* Trust indicators */}
          <div 
            className="mt-16 flex flex-col items-center gap-4 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <p className="text-sm text-muted-foreground">Trusted by marketers at</p>
            <div className="flex items-center gap-8 opacity-50">
              <div className="text-xl font-bold text-foreground">Shopify</div>
              <div className="text-xl font-bold text-foreground">Meta</div>
              <div className="text-xl font-bold text-foreground">TikTok</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
