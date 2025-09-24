import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  FileText,
  Database,
  Zap
} from "lucide-react";

interface NodeExecution {
  id: string;
  label: string;
  type: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  startTime?: Date;
  endTime?: Date;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  logs: Array<{
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: Date;
  }>;
  artifacts: Array<{
    name: string;
    type: string;
    size?: number;
    downloadUrl?: string;
  }>;
}

interface WorkflowRun {
  id: string;
  name: string;
  graphId: string;
  status: 'running' | 'completed' | 'failed' | 'aborted';
  startTime: Date;
  endTime?: Date;
  totalNodes: number;
  completedNodes: number;
  estimatedCost: number;
  executions: NodeExecution[];
}

const mockRun: WorkflowRun = {
  id: "run-123",
  name: "Case Study Analysis - Tech Startup Evaluation",
  graphId: "graph-456",
  status: 'completed',
  startTime: new Date(Date.now() - 180000), // 3 minutes ago
  endTime: new Date(Date.now() - 60000), // 1 minute ago
  totalNodes: 6,
  completedNodes: 6,
  estimatedCost: 0.47,
  executions: [
    {
      id: "ingest1",
      label: "Document Ingest",
      type: "DataIngest",
      status: 'success',
      startTime: new Date(Date.now() - 180000),
      endTime: new Date(Date.now() - 165000),
      inputs: {
        sources: ["https://example.com/pitch-deck.pdf", "Google Drive: /startup-analysis/"]
      },
      outputs: {
        documents: 3,
        totalPages: 47,
        extractedText: "4.2MB of processed content"
      },
      logs: [
        { level: 'info', message: 'Starting document ingestion', timestamp: new Date(Date.now() - 180000) },
        { level: 'success', message: 'Successfully processed 3 documents', timestamp: new Date(Date.now() - 165000) }
      ],
      artifacts: [
        { name: "extracted_text.json", type: "json", size: 4200000 },
        { name: "document_metadata.csv", type: "csv", size: 12500 }
      ]
    },
    {
      id: "extract1", 
      label: "Content Extraction",
      type: "Extractor",
      status: 'success',
      startTime: new Date(Date.now() - 165000),
      endTime: new Date(Date.now() - 145000),
      inputs: {
        documents: "3 processed documents",
        extractionRules: "Financial metrics, team info, market analysis"
      },
      outputs: {
        keyFacts: 127,
        financialMetrics: 23,
        teamMembers: 8
      },
      logs: [
        { level: 'info', message: 'Analyzing document structure', timestamp: new Date(Date.now() - 165000) },
        { level: 'info', message: 'Extracting financial data', timestamp: new Date(Date.now() - 155000) },
        { level: 'success', message: 'Extracted 127 key facts', timestamp: new Date(Date.now() - 145000) }
      ],
      artifacts: [
        { name: "extracted_facts.json", type: "json", size: 85000 },
        { name: "financial_summary.xlsx", type: "excel", size: 45000 }
      ]
    },
    {
      id: "research1",
      label: "Market Research", 
      type: "Researcher",
      status: 'success',
      startTime: new Date(Date.now() - 145000),
      endTime: new Date(Date.now() - 115000),
      inputs: {
        company: "TechStartup Inc",
        industry: "SaaS/B2B",
        competitors: ["CompetitorA", "CompetitorB", "CompetitorC"]
      },
      outputs: {
        marketSize: "$2.4B TAM",
        competitorAnalysis: "3 direct competitors analyzed",
        industryTrends: "5 key trends identified"
      },
      logs: [
        { level: 'info', message: 'Researching market landscape', timestamp: new Date(Date.now() - 145000) },
        { level: 'info', message: 'Analyzing competitor positioning', timestamp: new Date(Date.now() - 130000) },
        { level: 'success', message: 'Market research completed', timestamp: new Date(Date.now() - 115000) }
      ],
      artifacts: [
        { name: "market_research.pdf", type: "pdf", size: 1250000 },
        { name: "competitor_analysis.json", type: "json", size: 67000 }
      ]
    }
  ]
};

const RunDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [run] = useState<WorkflowRun>(mockRun);
  const [selectedNode, setSelectedNode] = useState<string>(run.executions[0]?.id || "");

  const currentExecution = run.executions.find(exec => exec.id === selectedNode);

  const getStatusIcon = (status: NodeExecution['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-brand-accent" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: NodeExecution['status']) => {
    switch (status) {
      case 'running':
        return 'text-brand-accent';
      case 'success':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getDuration = (start?: Date, end?: Date) => {
    if (!start) return 'N/A';
    if (!end) return 'Running...';
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    return `${duration}s`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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
              <h1 className="text-2xl font-bold text-foreground">{run.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>Run ID: {run.id}</span>
                <span>•</span>
                <span>Started: {run.startTime.toLocaleString()}</span>
                <span>•</span>
                <span>Duration: {getDuration(run.startTime, run.endTime)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={`${
                run.status === 'completed' ? 'border-green-500 text-green-500' :
                run.status === 'failed' ? 'border-red-500 text-red-500' :
                run.status === 'running' ? 'border-brand-accent text-brand-accent' :
                'border-muted-foreground text-muted-foreground'
              }`}
            >
              {getStatusIcon(run.status === 'completed' ? 'success' : run.status === 'failed' ? 'failed' : run.status === 'running' ? 'running' : 'idle')}
              {run.status.toUpperCase()}
            </Badge>
            
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Studio
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-primary/10">
                <Zap className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="font-semibold">{run.completedNodes}/{run.totalNodes} nodes</div>
              </div>
            </div>
          </Card>
          
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-accent/10">
                <Clock className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Latency</div>
                <div className="font-semibold">2.4s</div>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Database className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Est. Cost</div>
                <div className="font-semibold">${run.estimatedCost.toFixed(3)}</div>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Artifacts</div>
                <div className="font-semibold">{run.executions.reduce((sum, exec) => sum + exec.artifacts.length, 0)}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Timeline Sidebar */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Execution Timeline</h3>
            
            <div className="space-y-2">
              {run.executions.map((execution, index) => (
                <Card
                  key={execution.id}
                  className={`glass-card p-3 cursor-pointer transition-all hover:border-brand-primary/30 ${
                    selectedNode === execution.id ? 'border-brand-primary bg-brand-primary/5' : ''
                  }`}
                  onClick={() => setSelectedNode(execution.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(execution.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm">{execution.label}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span className={getStatusColor(execution.status)}>
                          {execution.status.toUpperCase()}
                        </span>
                        <span>{getDuration(execution.startTime, execution.endTime)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentExecution && (
              <Tabs defaultValue="outputs" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{currentExecution.label}</h3>
                    <p className="text-muted-foreground text-sm">{currentExecution.type}</p>
                  </div>
                  <TabsList>
                    <TabsTrigger value="outputs">Outputs</TabsTrigger>
                    <TabsTrigger value="inputs">Inputs</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="outputs" className="space-y-4">
                  <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-foreground">Output Data</h4>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export JSON
                      </Button>
                    </div>
                    <div className="bg-brand-muted/20 rounded-lg p-4">
                      <pre className="text-sm text-foreground font-mono overflow-x-auto">
                        {JSON.stringify(currentExecution.outputs, null, 2)}
                      </pre>
                    </div>
                  </Card>

                  {currentExecution.artifacts.length > 0 && (
                    <Card className="glass-card p-6">
                      <h4 className="font-semibold text-foreground mb-4">Generated Artifacts</h4>
                      <div className="grid gap-3">
                        {currentExecution.artifacts.map((artifact, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-brand-border/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-foreground">{artifact.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {artifact.type.toUpperCase()} • {artifact.size ? `${Math.round(artifact.size / 1024)}KB` : 'Unknown size'}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="inputs" className="space-y-4">
                  <Card className="glass-card p-6">
                    <h4 className="font-semibold text-foreground mb-4">Input Parameters</h4>
                    <div className="bg-brand-muted/20 rounded-lg p-4">
                      <pre className="text-sm text-foreground font-mono overflow-x-auto">
                        {JSON.stringify(currentExecution.inputs, null, 2)}
                      </pre>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                  <Card className="glass-card p-6">
                    <h4 className="font-semibold text-foreground mb-4">Execution Logs</h4>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {currentExecution.logs.map((log, index) => (
                          <div key={index} className="flex items-start gap-3 p-2 text-sm">
                            <div className="flex-shrink-0 w-16 text-xs text-muted-foreground font-mono">
                              {log.timestamp.toLocaleTimeString()}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                log.level === 'error' ? 'border-red-500 text-red-500' :
                                log.level === 'warning' ? 'border-yellow-500 text-yellow-500' :
                                log.level === 'success' ? 'border-green-500 text-green-500' :
                                'border-muted-foreground text-muted-foreground'
                              }`}
                            >
                              {log.level.toUpperCase()}
                            </Badge>
                            <div className="flex-1 text-foreground">{log.message}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunDetail;