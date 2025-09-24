import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Database, 
  Wrench, 
  Settings, 
  FileOutput,
  Zap,
  Search,
  FileText,
  BarChart3,
  Cpu
} from 'lucide-react';

const getNodeIcon = (nodeType: string) => {
  const iconMap: Record<string, any> = {
    'DataIngest': Database,
    'Extractor': FileText,
    'Researcher': Search,
    'Planner': Cpu,
    'Generator': Zap,
    'Synthesizer': Brain,
    'Formatter': FileOutput,
    'Evaluator': BarChart3,
    'WebScraper': Search,
    'DiffEngine': Settings,
    'Summarizer': FileText,
    'Notifier': Zap,
    'Dashboard': BarChart3,
    'Scheduler': Settings,
    'Processor': Cpu,
    'Output': FileOutput,
    'Executor': Zap,
    'Optimizer': Settings,
  };
  
  return iconMap[nodeType] || Brain;
};

const getNodeColor = (nodeType: string) => {
  const colorMap: Record<string, string> = {
    'DataIngest': 'blue',
    'Extractor': 'green',
    'Researcher': 'purple',
    'Planner': 'orange',
    'Generator': 'pink',
    'Synthesizer': 'cyan',
    'Formatter': 'yellow',
    'Evaluator': 'red',
    'WebScraper': 'indigo',
    'DiffEngine': 'gray',
    'Summarizer': 'emerald',
    'Notifier': 'violet',
    'Dashboard': 'amber',
    'Scheduler': 'teal',
    'Processor': 'slate',
    'Output': 'lime',
    'Executor': 'rose',
    'Optimizer': 'sky',
  };
  
  return colorMap[nodeType] || 'blue';
};

export const AIAgentNode = memo(({ data, selected }: NodeProps) => {
  const nodeType = String(data?.type || 'Unknown');
  const nodeLabel = String(data?.label || 'Unnamed Node');
  const nodeConfig = data?.config || {};
  
  const IconComponent = getNodeIcon(nodeType);
  const nodeColor = getNodeColor(nodeType);
  
  return (
    <Card className={`
      w-64 bg-brand-surface border-2 transition-all duration-200
      ${selected ? 'border-brand-primary shadow-glow' : 'border-brand-border hover:border-brand-primary/50'}
    `}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-brand-accent border-2 border-background"
      />
      
      {/* Node Content */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg bg-${nodeColor}-500/10`}>
            <IconComponent className={`w-5 h-5 text-${nodeColor}-400`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-foreground">
              {nodeLabel}
            </h3>
            <Badge variant="outline" className="text-xs mt-1">
              {nodeType}
            </Badge>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Ready</span>
          </div>
          
          {/* Configuration Count */}
          {Object.keys(nodeConfig).length > 0 && (
            <Badge variant="outline" className="text-xs">
              {Object.keys(nodeConfig).length} configs
            </Badge>
          )}
        </div>
      </div>
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-brand-primary border-2 border-background"
      />
    </Card>
  );
});