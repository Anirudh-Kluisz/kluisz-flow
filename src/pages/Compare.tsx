import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trophy, DollarSign, Clock, Target, Play, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModelResult {
  provider: string;
  model: string;
  cost: { inputTokens: number; outputTokens: number; totalUSD: number };
  latency: { p50: number; p95: number; totalMs: number };
  accuracy: { score: number; rubric?: string; notes?: string };
  artifacts?: { samples: string[] };
}

interface Experiment {
  id: string;
  name: string;
  createdAt: Date;
  graphId: string;
  modelsTested: ModelResult[];
}

const mockExperiments: Experiment[] = [
  {
    id: "exp-1",
    name: "Case Study Analysis - Model Comparison",
    createdAt: new Date(Date.now() - 86400000),
    graphId: "graph-1",
    modelsTested: [
      {
        provider: "OpenAI",
        model: "gpt-4",
        cost: { inputTokens: 12500, outputTokens: 3200, totalUSD: 0.47 },
        latency: { p50: 2400, p95: 4100, totalMs: 28500 },
        accuracy: { score: 0.92, rubric: "Factual accuracy and coherence", notes: "Excellent analysis depth" }
      },
      {
        provider: "Anthropic", 
        model: "claude-3-sonnet",
        cost: { inputTokens: 12500, outputTokens: 3400, totalUSD: 0.31 },
        latency: { p50: 1800, p95: 2900, totalMs: 22100 },
        accuracy: { score: 0.89, rubric: "Factual accuracy and coherence", notes: "Good analysis, slightly less depth" }
      },
      {
        provider: "DeepSeek",
        model: "deepseek-chat",
        cost: { inputTokens: 12500, outputTokens: 3100, totalUSD: 0.04 },
        latency: { p50: 3200, p95: 5800, totalMs: 41200 },
        accuracy: { score: 0.85, rubric: "Factual accuracy and coherence", notes: "Solid analysis, very cost-effective" }
      }
    ]
  }
];

const Compare = () => {
  const navigate = useNavigate();
  const [selectedExperiment, setSelectedExperiment] = useState<string>(mockExperiments[0]?.id || "");
  const [newComparisonForm, setNewComparisonForm] = useState({
    name: "",
    graphId: "",
    models: [] as string[],
    rubric: ""
  });

  const currentExperiment = mockExperiments.find(exp => exp.id === selectedExperiment);
  
  const getWinner = (metric: keyof Pick<ModelResult, 'cost' | 'latency' | 'accuracy'>) => {
    if (!currentExperiment) return null;
    
    return currentExperiment.modelsTested.reduce((winner, current) => {
      switch (metric) {
        case 'cost':
          return current.cost.totalUSD < winner.cost.totalUSD ? current : winner;
        case 'latency': 
          return current.latency.p50 < winner.latency.p50 ? current : winner;
        case 'accuracy':
          return current.accuracy.score > winner.accuracy.score ? current : winner;
        default:
          return winner;
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="hover:bg-brand-muted/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Compare builds</h1>
            <p className="text-muted-foreground">Compare cost, latency, and accuracy across different models</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Experiments List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Experiments</h3>
              <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90">
                <Play className="w-3 h-3 mr-1" />
                New
              </Button>
            </div>
            
            <div className="space-y-2">
              {mockExperiments.map((exp) => (
                <Card
                  key={exp.id}
                  className={`glass-card p-3 cursor-pointer transition-all hover:border-brand-primary/30 ${
                    selectedExperiment === exp.id ? 'border-brand-primary bg-brand-primary/5' : ''
                  }`}
                  onClick={() => setSelectedExperiment(exp.id)}
                >
                  <h4 className="font-medium text-foreground text-sm">{exp.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exp.createdAt.toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {exp.modelsTested.length} models
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="results" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="setup">New Comparison</TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-6">
                {currentExperiment && (
                  <>
                    {/* Comparison Grid */}
                    <Card className="glass-card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-foreground">{currentExperiment.name}</h3>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export Results
                        </Button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-brand-border">
                              <th className="text-left p-3 text-muted-foreground font-medium">Model</th>
                              <th className="text-right p-3 text-muted-foreground font-medium">Cost (USD)</th>
                              <th className="text-right p-3 text-muted-foreground font-medium">Latency (ms)</th>
                              <th className="text-right p-3 text-muted-foreground font-medium">Accuracy</th>
                              <th className="text-right p-3 text-muted-foreground font-medium">Winner</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentExperiment.modelsTested.map((result, index) => {
                              const costWinner = getWinner('cost');
                              const latencyWinner = getWinner('latency');
                              const accuracyWinner = getWinner('accuracy');
                              
                              return (
                                <tr key={index} className="border-b border-brand-border/30">
                                  <td className="p-3">
                                    <div>
                                      <div className="font-medium text-foreground">{result.model}</div>
                                      <div className="text-sm text-muted-foreground">{result.provider}</div>
                                    </div>
                                  </td>
                                  <td className="text-right p-3">
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="font-mono">${result.cost.totalUSD.toFixed(3)}</span>
                                      {costWinner?.model === result.model && (
                                        <Trophy className="w-4 h-4 text-brand-accent" />
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {result.cost.inputTokens.toLocaleString()}in / {result.cost.outputTokens.toLocaleString()}out
                                    </div>
                                  </td>
                                  <td className="text-right p-3">
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="font-mono">{result.latency.p50}ms</span>
                                      {latencyWinner?.model === result.model && (
                                        <Trophy className="w-4 h-4 text-brand-accent" />
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      p95: {result.latency.p95}ms
                                    </div>
                                  </td>
                                  <td className="text-right p-3">
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="font-mono">{(result.accuracy.score * 100).toFixed(1)}%</span>
                                      {accuracyWinner?.model === result.model && (
                                        <Trophy className="w-4 h-4 text-brand-accent" />
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-right p-3">
                                    <div className="flex justify-end gap-1">
                                      {costWinner?.model === result.model && (
                                        <Badge variant="secondary" className="text-xs">
                                          <DollarSign className="w-3 h-3 mr-1" />
                                          Cost
                                        </Badge>
                                      )}
                                      {latencyWinner?.model === result.model && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Clock className="w-3 h-3 mr-1" />
                                          Speed
                                        </Badge>
                                      )}
                                      {accuracyWinner?.model === result.model && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Target className="w-3 h-3 mr-1" />
                                          Quality
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    {/* Sample Outputs */}
                    <Card className="glass-card p-6">
                      <h4 className="font-semibold text-foreground mb-4">Sample Outputs</h4>
                      <div className="space-y-4">
                        {currentExperiment.modelsTested.map((result, index) => (
                          <div key={index} className="border border-brand-border/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-foreground">{result.model}</span>
                              <Badge variant="outline">{(result.accuracy.score * 100).toFixed(1)}% accuracy</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground bg-brand-muted/20 rounded p-3 font-mono">
                              {result.artifacts?.samples?.[0] || "Sample output would appear here..."}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="setup" className="space-y-6">
                <Card className="glass-card p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-6">Run New Comparison</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Experiment Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Marketing Copy Generation"
                          value={newComparisonForm.name}
                          onChange={(e) => setNewComparisonForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="graph">Workflow</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select saved workflow" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="case-study">Case Study Analysis</SelectItem>
                            <SelectItem value="competitor">Competitor Scanning</SelectItem>
                            <SelectItem value="marketing">Marketing Campaign</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Models to Compare</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {["GPT-4", "Claude-3 Sonnet", "DeepSeek Chat", "Gemini Pro", "Llama 3.1", "GPT-4o Mini"].map((model) => (
                          <label key={model} className="flex items-center space-x-2 p-3 border border-brand-border rounded-lg cursor-pointer hover:bg-brand-muted/30">
                            <input type="checkbox" className="rounded border-brand-border" />
                            <span className="text-sm">{model}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rubric">Evaluation Rubric</Label>
                      <Textarea
                        id="rubric"
                        placeholder="Describe what makes a good output for this task..."
                        value={newComparisonForm.rubric}
                        onChange={(e) => setNewComparisonForm(prev => ({ ...prev, rubric: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button className="bg-brand-primary hover:bg-brand-primary/90">
                        <Play className="w-4 h-4 mr-2" />
                        Run Comparison
                      </Button>
                      <Button variant="outline">
                        Save Draft
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;