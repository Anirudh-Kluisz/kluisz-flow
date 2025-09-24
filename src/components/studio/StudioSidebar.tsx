import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Brain, 
  Database, 
  Wrench, 
  Settings, 
  FileOutput,
  ChevronDown,
  Plus,
  Cpu,
  Search,
  FileText,
  Zap,
  Globe,
  Mail,
  Calendar,
  BarChart3
} from "lucide-react";
import { useStudioStore } from "@/stores/studioStore";

const sidebarSections = [
  {
    title: "Agents & Primitives",
    icon: Brain,
    items: [
      { name: "Planner", icon: Cpu, description: "Strategic planning and goal setting" },
      { name: "Researcher", icon: Search, description: "Data research and collection" },
      { name: "Extractor", icon: FileText, description: "Content parsing and extraction" },
      { name: "Generator", icon: Zap, description: "Content and asset generation" },
      { name: "Evaluator", icon: BarChart3, description: "Quality assessment and metrics" },
    ]
  },
  {
    title: "Data / Connectors",
    icon: Database,
    items: [
      { name: "Google Drive", icon: Database, description: "Access files and folders" },
      { name: "Web Scraper", icon: Globe, description: "Extract web content" },
      { name: "Email", icon: Mail, description: "Email integration" },
      { name: "Calendar", icon: Calendar, description: "Schedule management" },
    ]
  },
  {
    title: "Tools",
    icon: Wrench,
    items: [
      { name: "Web Search", icon: Search, description: "Search the internet" },
      { name: "Code Interpreter", icon: Cpu, description: "Execute code safely" },
      { name: "Email Sender", icon: Mail, description: "Send automated emails" },
    ]
  },
  {
    title: "Control",
    icon: Settings,
    items: [
      { name: "If/Else", icon: Settings, description: "Conditional logic" },
      { name: "Scheduler", icon: Calendar, description: "Time-based triggers" },
      { name: "Retry", icon: Zap, description: "Error handling and retries" },
    ]
  },
  {
    title: "Outputs",
    icon: FileOutput,
    items: [
      { name: "Report", icon: FileText, description: "Generate reports" },
      { name: "Dashboard", icon: BarChart3, description: "Create dashboards" },
      { name: "JSON Export", icon: FileText, description: "Export structured data" },
    ]
  }
];

export const StudioSidebar = () => {
  const [openSections, setOpenSections] = useState<string[]>(["Agents & Primitives"]);
  const { sidebarCollapsed, setSidebarCollapsed, nodes, setNodes } = useStudioStore();

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleDragStart = (event: React.DragEvent, nodeType: string, nodeName: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ 
      type: nodeType, 
      name: nodeName 
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const addNode = (nodeType: string, nodeName: string) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'aiAgent',
      position: { x: 100 + nodes.length * 50, y: 100 + nodes.length * 50 },
      data: {
        label: nodeName,
        type: nodeType,
        config: {},
      },
    };
    setNodes([...nodes, newNode]);
  };

  if (sidebarCollapsed) {
    return (
      <div className="w-16 bg-brand-surface border-r border-brand-border flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(false)}
          className="w-10 h-10 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
        {sidebarSections.map((section) => (
          <Button
            key={section.title}
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
            title={section.title}
          >
            <section.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card className="w-80 bg-brand-surface border-r border-brand-border rounded-none h-full">
      <div className="p-4 border-b border-brand-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Node Library</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(true)}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Drag nodes to canvas or click to add
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {sidebarSections.map((section) => (
            <Collapsible
              key={section.title}
              open={openSections.includes(section.title)}
              onOpenChange={() => toggleSection(section.title)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto text-left hover:bg-brand-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="w-4 h-4" />
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2">
                <div className="space-y-2 ml-6">
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      draggable
                      onDragStart={(e) => handleDragStart(e, section.title, item.name)}
                      onClick={() => addNode(section.title, item.name)}
                      className="p-3 rounded-lg border border-brand-border hover:border-brand-primary/50 hover:bg-brand-muted/30 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-brand-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-brand-primary transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                        <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};