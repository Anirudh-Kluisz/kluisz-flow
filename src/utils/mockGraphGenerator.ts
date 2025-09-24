import { GraphSpec } from "@/stores/studioStore";

export const generateMockGraphSpec = (prompt: string): GraphSpec => {
  // Simple keyword-based graph generation for demo purposes
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('case-study') || lowerPrompt.includes('analysis') || lowerPrompt.includes('pdf')) {
    return {
      name: "Case-Study Analysis Agent",
      description: "Extracts findings from PDFs, benchmarks, and produces slides",
      nodes: [
        {
          id: "ingest1",
          type: "DataIngest",
          label: "PDF & Document Ingest",
          config: { sources: ["drive", "web", "upload"] }
        },
        {
          id: "extract1",
          type: "Extractor",
          label: "Content Extractor",
          config: { formats: ["pdf", "docx", "pptx"] }
        },
        {
          id: "research1",
          type: "Researcher",
          label: "Benchmark Researcher",
          config: { sources: ["web", "industry_db"] }
        },
        {
          id: "synthesize1",
          type: "Synthesizer",
          label: "Insight Synthesizer",
          config: { output_format: "structured" }
        },
        {
          id: "format1",
          type: "Formatter",
          label: "Slide Generator",
          config: { template: "corporate", format: "pptx" }
        },
        {
          id: "eval1",
          type: "Evaluator",
          label: "Quality Evaluator",
          config: { rubric: "completeness" }
        }
      ],
      edges: [
        { source: "ingest1", target: "extract1" },
        { source: "extract1", target: "research1" },
        { source: "research1", target: "synthesize1" },
        { source: "synthesize1", target: "format1" },
        { source: "format1", target: "eval1" }
      ],
      inputsNeeded: ["googleDriveLinks", "targetCompanies", "rubric"]
    };
  }
  
  if (lowerPrompt.includes('competitor') || lowerPrompt.includes('monitoring') || lowerPrompt.includes('scanning')) {
    return {
      name: "Competitor Scanning Agent",
      description: "Monitors websites, filings, news, and summarizes deltas weekly",
      nodes: [
        {
          id: "scheduler1",
          type: "Scheduler",
          label: "CRON Scheduler",
          config: { frequency: "weekly" }
        },
        {
          id: "scraper1",
          type: "WebScraper",
          label: "Website Monitor",
          config: { targets: [] }
        },
        {
          id: "diff1",
          type: "DiffEngine",
          label: "Change Detector",
          config: { sensitivity: "medium" }
        },
        {
          id: "summarize1",
          type: "Summarizer",
          label: "Delta Summarizer",
          config: { format: "highlights" }
        },
        {
          id: "notify1",
          type: "Notifier",
          label: "Alert System",
          config: { channels: ["slack", "email"] }
        },
        {
          id: "dashboard1",
          type: "Dashboard",
          label: "Trend Dashboard",
          config: { metrics: ["changes", "frequency"] }
        }
      ],
      edges: [
        { source: "scheduler1", target: "scraper1" },
        { source: "scraper1", target: "diff1" },
        { source: "diff1", target: "summarize1" },
        { source: "summarize1", target: "notify1" },
        { source: "summarize1", target: "dashboard1" }
      ],
      inputsNeeded: ["targetUrls", "slackWebhook", "emailList"]
    };
  }
  
  if (lowerPrompt.includes('marketing') || lowerPrompt.includes('campaign') || lowerPrompt.includes('creative')) {
    return {
      name: "Marketing Campaign Agent",
      description: "Plan, create, launch, and analyze marketing campaigns",
      nodes: [
        {
          id: "plan1",
          type: "Planner",
          label: "Campaign Planner",
          config: { objectives: [] }
        },
        {
          id: "research1",
          type: "Researcher",
          label: "Audience Research",
          config: { sources: ["social", "surveys"] }
        },
        {
          id: "generate1",
          type: "Generator",
          label: "Creative Generator",
          config: { channels: ["linkedin", "email", "ads"] }
        },
        {
          id: "execute1",
          type: "Executor",
          label: "Campaign Launcher",
          config: { platforms: [] }
        },
        {
          id: "evaluate1",
          type: "Evaluator",
          label: "Performance Analyzer",
          config: { metrics: ["ctr", "cpl", "roas"] }
        },
        {
          id: "optimize1",
          type: "Optimizer",
          label: "A/B Test Manager",
          config: { variants: 3 }
        }
      ],
      edges: [
        { source: "plan1", target: "research1" },
        { source: "research1", target: "generate1" },
        { source: "generate1", target: "execute1" },
        { source: "execute1", target: "evaluate1" },
        { source: "evaluate1", target: "optimize1" },
        { source: "optimize1", target: "generate1", label: "feedback" }
      ],
      inputsNeeded: ["icp", "budget", "platforms", "apiKeys"]
    };
  }
  
  // Default generic workflow
  return {
    name: "Custom AI Workflow",
    description: "A custom AI agent workflow tailored to your needs",
    nodes: [
      {
        id: "input1",
        type: "DataIngest",
        label: "Data Input",
        config: { sources: [] }
      },
      {
        id: "process1",
        type: "Processor",
        label: "AI Processor",
        config: { model: "claude-3-sonnet" }
      },
      {
        id: "output1",
        type: "Output",
        label: "Result Output",
        config: { format: "json" }
      }
    ],
    edges: [
      { source: "input1", target: "process1" },
      { source: "process1", target: "output1" }
    ],
    inputsNeeded: ["data", "parameters"]
  };
};