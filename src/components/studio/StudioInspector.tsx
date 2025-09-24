import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStudioStore } from "@/stores/studioStore";
import { Settings, ArrowLeftRight, FileText, ChevronLeft } from "lucide-react";
import { useState } from "react";

export const StudioInspector = () => {
  const { selectedNode, nodes, inspectorTab, setInspectorTab } = useStudioStore();
  const [collapsed, setCollapsed] = useState(false);
  
  const currentNode = nodes.find(node => node.id === selectedNode);

  if (collapsed) {
    return (
      <div className="w-12 bg-brand-surface border-l border-brand-border flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 p-0"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-80 bg-brand-surface border-l border-brand-border rounded-none h-full">
      {/* Header */}
      <div className="p-4 border-b border-brand-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Inspector</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(true)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        {currentNode ? (
          <div className="mt-2">
            <p className="text-sm font-medium">{String(currentNode.data?.label || 'Unnamed Node')}</p>
            <Badge variant="outline" className="mt-1 text-xs">
              {String(currentNode.data?.type || 'Unknown')}
            </Badge>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">
            Select a node to inspect
          </p>
        )}
      </div>

      {/* Content */}
      {currentNode ? (
        <Tabs value={inspectorTab} onValueChange={(tab) => setInspectorTab(tab as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
            <TabsTrigger value="config" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Config
            </TabsTrigger>
            <TabsTrigger value="io" className="text-xs">
              <ArrowLeftRight className="w-3 h-3 mr-1" />
              I/O
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="flex-1 m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="node-name">Node Name</Label>
                  <Input
                    id="node-name"
                    value={String(currentNode.data?.label || '')}
                    className="mt-1 bg-brand-bg border-brand-border"
                  />
                </div>

                <div>
                  <Label htmlFor="node-description">Description</Label>
                  <Textarea
                    id="node-description"
                    placeholder="Describe what this node does..."
                    className="mt-1 bg-brand-bg border-brand-border"
                    rows={3}
                  />
                </div>

                {/* Node-specific configuration */}
                {String(currentNode.data?.type) === 'DataIngest' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Data Sources</Label>
                      <div className="mt-2 space-y-2">
                        {['Google Drive', 'Web Scraping', 'File Upload'].map((source) => (
                          <div key={source} className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">{source}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {String(currentNode.data?.type) === 'Generator' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="output-format">Output Format</Label>
                      <select className="w-full mt-1 p-2 rounded bg-brand-bg border border-brand-border">
                        <option>Text</option>
                        <option>HTML</option>
                        <option>JSON</option>
                        <option>Markdown</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="creativity">Creativity Level</Label>
                      <input
                        type="range"
                        id="creativity"
                        min="0"
                        max="100"
                        className="w-full mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="io" className="flex-1 m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Inputs</h4>
                  <div className="bg-brand-bg border border-brand-border rounded p-3">
                    <pre className="text-xs text-muted-foreground">
{JSON.stringify({
  "prompt": "Generate marketing copy for our new AI product",
  "audience": "Technical professionals",
  "tone": "Professional but approachable"
}, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Outputs</h4>
                  <div className="bg-brand-bg border border-brand-border rounded p-3">
                    <pre className="text-xs text-muted-foreground">
{JSON.stringify({
  "content": "Introducing the future of AI automation...",
  "word_count": 245,
  "readability_score": 8.2
}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="logs" className="flex-1 m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-3">
                <div className="text-xs">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                      SUCCESS
                    </Badge>
                    <span className="text-muted-foreground">2:34 PM</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">Node executed successfully</p>
                </div>

                <div className="text-xs">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      INFO
                    </Badge>
                    <span className="text-muted-foreground">2:34 PM</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">Processing input data...</p>
                </div>

                <div className="text-xs">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      INFO
                    </Badge>
                    <span className="text-muted-foreground">2:33 PM</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">Node started</p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a node to view configuration</p>
          </div>
        </div>
      )}
    </Card>
  );
};