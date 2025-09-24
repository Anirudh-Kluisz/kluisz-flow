import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Megaphone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStudioStore } from "@/stores/studioStore";
import { generateMockGraphSpec } from "@/utils/mockGraphGenerator";
import { useToast } from "@/hooks/use-toast";

const examplePrompts = [
  {
    id: 1,
    title: "Case-Study Analysis Agent",
    description: "Extract findings from PDFs, research benchmarks, and produce presentation slides",
    prompt: "Build a case-study analysis agent that extracts key findings from PDFs, benchmarks against industry data, and automatically generates presentation slides",
    icon: FileText,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    id: 2,
    title: "Competitor Scanning Agent",
    description: "Monitor websites, filings, news, and summarize changes weekly",
    prompt: "Create a competitor scanning agent that monitors competitor websites, SEC filings, and news sources, then summarizes key changes and trends weekly",
    icon: Search,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    id: 3,
    title: "Marketing Campaign Agent",
    description: "Generate ICP-specific creatives, run A/B tests, and report results",
    prompt: "Design a marketing campaign agent that generates ICP-specific creative content, manages A/B tests across channels, and provides performance analysis",
    icon: Megaphone,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
];

export const ExamplePrompts = () => {
  const navigate = useNavigate();
  const { loadGraphSpec } = useStudioStore();
  const { toast } = useToast();

  const handlePromptClick = (prompt: string, title: string) => {
    const graphSpec = generateMockGraphSpec(prompt);
    loadGraphSpec(graphSpec);
    
    toast({
      title: "Workflow Generated!",
      description: `Created "${title}" workflow with ${graphSpec.nodes.length} agents.`,
    });
    
    navigate('/studio');
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <h3 className="text-lg font-semibold text-foreground mb-6">Try these examples:</h3>
      
      <div className="space-y-3">
        {examplePrompts.map((example) => (
          <Card key={example.id} className="glass-card p-4 hover:border-brand-primary/30 transition-all duration-300 group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${example.bgColor}`}>
                <example.icon className={`w-5 h-5 ${example.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground group-hover:text-brand-primary transition-colors">
                  {example.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {example.description}
                </p>
              </div>
              
              <Button
                onClick={() => handlePromptClick(example.prompt, example.title)}
                variant="outline"
                size="sm"
                className="border-brand-border hover:bg-brand-primary hover:text-background hover:border-brand-primary opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                Use this
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};