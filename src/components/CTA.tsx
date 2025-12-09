import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-primary">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/15 border border-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Start your free trial today</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Ad Campaigns?
          </h2>
          
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses using Vibelets to create, launch, and optimize ads without the complexity. No marketing expertise required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="xl" 
              className="bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              asChild
            >
              <Link to="/dashboard">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="border-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
            >
              Book a Demo
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-primary-foreground/60">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;