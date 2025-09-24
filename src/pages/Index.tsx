import { LandingHero } from "@/components/landing/LandingHero";
import { LandingChat } from "@/components/landing/LandingChat";
import { ExamplePrompts } from "@/components/landing/ExamplePrompts";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Left Side - Hero */}
          <div className="space-y-8">
            <LandingHero />
            <ExamplePrompts />
          </div>
          
          {/* Right Side - Chat */}
          <div className="lg:sticky lg:top-12">
            <LandingChat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;