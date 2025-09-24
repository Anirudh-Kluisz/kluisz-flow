import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStudioStore } from "@/stores/studioStore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Square, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Maximize,
  TestTube,
  Clock,
  Settings
} from "lucide-react";

export const StudioToolbar = () => {
  const { isRunning, setIsRunning, nodes, runStatus } = useStudioStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRun = () => {
    if (nodes.length === 0) {
      toast({
        title: "No Workflow",
        description: "Add some nodes to your canvas first.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    
    // Generate a run ID and navigate to run detail page
    const runId = `run-${Date.now()}`;
    
    toast({
      title: "Workflow Started",
      description: `Running ${nodes.length} nodes...`,
    });

    // Navigate to run detail page 
    navigate(`/runs/${runId}`);
  };

  const handleStop = () => {
    setIsRunning(false);
    toast({
      title: "Workflow Stopped",
      description: "Execution halted.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Workflow saved successfully.",
    });
  };

  const handleExport = () => {
    const workflow = { nodes, edges: [] };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "Workflow exported as JSON.",
    });
  };

  const runningNodes = Object.values(runStatus).filter(status => status === 'running').length;
  const successNodes = Object.values(runStatus).filter(status => status === 'success').length;
  const failedNodes = Object.values(runStatus).filter(status => status === 'failed').length;

  return (
    <div className="h-16 bg-brand-surface border-b border-brand-border px-6 flex items-center justify-between">
      {/* Left Section - Run Controls */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <Button 
            onClick={handleRun}
            className="bg-brand-primary hover:bg-brand-primary/90 text-background"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Workflow
          </Button>
        ) : (
          <Button 
            onClick={handleStop}
            variant="destructive"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}

        <Button variant="outline" className="border-brand-border hover:bg-brand-muted/50">
          <TestTube className="w-4 h-4 mr-2" />
          Dry Run
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Status Badges */}
        {isRunning && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Clock className="w-3 h-3 mr-1" />
              Running: {runningNodes}
            </Badge>
            {successNodes > 0 && (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                ✓ {successNodes}
              </Badge>
            )}
            {failedNodes > 0 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                ✗ {failedNodes}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Center Section - Workflow Info */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-sm font-medium">AI Marketing Workflow</p>
          <p className="text-xs text-muted-foreground">{nodes.length} nodes</p>
        </div>
      </div>

      {/* Right Section - File & View Controls */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSave}
          className="border-brand-border hover:bg-brand-muted/50"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExport}
          className="border-brand-border hover:bg-brand-muted/50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <Button 
          variant="outline" 
          size="sm"
          className="border-brand-border hover:bg-brand-muted/50"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Maximize className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/settings')}
          className="hover:bg-brand-muted/50"
          data-testid="button-settings-studio"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};