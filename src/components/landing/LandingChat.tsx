import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Mic, Paperclip, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStudioStore } from "@/stores/studioStore";
import { generateMockGraphSpec } from "@/utils/mockGraphGenerator";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const LandingChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI Studio architect. Describe the workflow you'd like to build, and I'll generate a visual agent graph for you. Try one of the examples below, or describe your own use case.",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loadGraphSpec } = useStudioStore();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const graphSpec = generateMockGraphSpec(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Perfect! I've designed a "${graphSpec.name}" workflow for you. This includes ${graphSpec.nodes.length} connected agents: ${graphSpec.nodes.map(n => n.label).join(', ')}. Ready to build it in the studio?`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Load the graph and navigate after a brief delay
      setTimeout(() => {
        loadGraphSpec(graphSpec);
        toast({
          title: "Workflow Generated!",
          description: `Created "${graphSpec.name}" with ${graphSpec.nodes.length} agents.`,
        });
        navigate('/studio');
      }, 1000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card h-[600px] flex flex-col glow-border">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></div>
          <span className="font-semibold">AI Studio Architect</span>
          <Badge variant="outline" className="ml-auto text-xs bg-brand-primary/10 text-brand-primary border-brand-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            GPT-4
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user' 
                  ? 'bg-brand-primary text-background' 
                  : 'bg-brand-surface border border-brand-border'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-brand-surface border border-brand-border rounded-2xl px-4 py-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Generating workflow...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe the workflow you want to build..."
              className="pr-20 bg-brand-surface border-brand-border focus:border-brand-primary"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-brand-muted">
                <Paperclip className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-brand-muted">
                <Mic className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-brand-primary hover:bg-brand-primary/90 text-background"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};