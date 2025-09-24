import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Brain, Workflow } from "lucide-react";
import heroWorkflow from "@/assets/hero-workflow.jpg";

export const LandingHero = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Background Image */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80 z-10" />
        <img 
          src={heroWorkflow} 
          alt="AI Workflow Visualization" 
          className="w-full h-64 object-cover rounded-2xl opacity-40"
        />
        
        {/* Content Overlay */}
        <div className="relative z-20 -mt-40 space-y-8">
          {/* Badge */}
          <Badge variant="outline" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/20 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            AI Studio v2.0 - Now with Visual Workflows
          </Badge>
          
          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Build and compare{" "}
              <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                agentic workflows
              </span>
              .
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Create intelligent AI agents that work together. From research and analysis 
              to content generation and automation - build complex workflows with simple conversations.
            </p>
          </div>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 glass-card px-4 py-2">
              <Brain className="w-5 h-5 text-brand-primary" />
              <span className="text-sm">Multi-Agent Orchestration</span>
            </div>
            <div className="flex items-center gap-2 glass-card px-4 py-2">
              <Zap className="w-5 h-5 text-brand-primary" />
              <span className="text-sm">One-Click Deploy</span>
            </div>
            <a 
              href="/compare"
              className="flex items-center gap-2 glass-card px-4 py-2 hover:bg-brand-muted/50 transition-colors cursor-pointer"
            >
              <Workflow className="w-5 h-5 text-brand-accent" />
              <span className="text-sm">Compare builds</span>
            </a>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex gap-4 flex-wrap">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-background font-semibold">
              Start Building
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="border-brand-border hover:bg-brand-muted/50">
              View Examples
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};