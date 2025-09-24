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
    <div className="space-y-6 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Start from an example</h2>
        <p className="text-muted-foreground">Choose a pre-built workflow and customize it to your needs</p>
      </div>
      
      <div className="grid gap-4">
        {examplePrompts.map((example) => (
          <Card 
            key={example.id} 
            className="glass-card p-6 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-300 group cursor-pointer"
            onClick={() => handlePromptClick(example.prompt, example.title)}
          >
            <div className="flex items-start gap-6">
              <div className={`p-3 rounded-xl ${example.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <example.icon className={`w-6 h-6 ${example.color}`} />
              </div>
              
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors">
                    {example.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    {example.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-brand-primary/60"></div>
                    <span>5-7 nodes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-brand-accent/60"></div>
                    <span>Ready to run</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="border-brand-border hover:bg-brand-primary hover:text-background hover:border-brand-primary opacity-0 group-hover:opacity-100 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePromptClick(example.prompt, example.title);
                }}
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