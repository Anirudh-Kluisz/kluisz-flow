import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Key, Brain, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AIProvider = 'openai' | 'gemini' | 'anthropic';

interface AIConfig {
  provider: AIProvider;
  apiKeys: {
    openai?: string;
    gemini?: string;
    anthropic?: string;
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [config, setConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKeys: {}
  });
  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(null);
  const [testResults, setTestResults] = useState<Record<AIProvider, boolean | null>>({
    openai: null,
    gemini: null,
    anthropic: null
  });

  const loadConfigFromBackend = async () => {
    try {
      const response = await fetch('/api/ai-providers/config');
      if (response.ok) {
        const backendConfig = await response.json();
        setConfig(prev => ({
          ...prev,
          provider: backendConfig.provider || 'openai',
          apiKeys: {} // Never store API keys on frontend
        }));
        
        // Update test results based on which keys are available
        setTestResults({
          openai: backendConfig.hasKeys.openai ? null : false,
          gemini: backendConfig.hasKeys.gemini ? null : false,
          anthropic: backendConfig.hasKeys.anthropic ? null : false
        });
      }
    } catch (error) {
      console.error('Failed to load config from backend:', error);
    }
  };

  // Load configuration from backend on component mount
  useEffect(() => {
    loadConfigFromBackend();
  }, []);

  const saveConfig = async () => {
    try {
      // Save each configured API key to the backend
      const promises = Object.entries(config.apiKeys).map(async ([provider, apiKey]) => {
        if (apiKey && apiKey.trim()) {
          const response = await fetch('/api/ai-providers/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to save ${provider} API key`);
          }
        }
      });
      
      await Promise.all(promises);
      
      // Save the selected provider
      const providerResponse = await fetch('/api/ai-providers/set-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: config.provider }),
      });
      
      if (!providerResponse.ok) {
        throw new Error('Failed to save selected provider');
      }
      
      toast({
        title: "Settings Saved",
        description: "Your AI provider configuration has been saved securely.",
      });
      
      // Reload configuration from backend to get updated status
      await loadConfigFromBackend();
      
    } catch (error) {
      toast({
        title: "Save Failed",
        description: `Failed to save configuration: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const testConnection = async (provider: AIProvider) => {
    const localApiKey = config.apiKeys[provider];
    
    // Check if we have a local key to save first, or if one is already stored on backend
    if (!localApiKey && testResults[provider] === false) {
      toast({
        title: "API Key Required",
        description: `Please enter your ${provider.toUpperCase()} API key before testing.`,
        variant: "destructive"
      });
      return;
    }

    setTestingProvider(provider);
    
    try {
      // If we have a local API key, save it first
      if (localApiKey && localApiKey.trim()) {
        const saveResponse = await fetch('/api/ai-providers/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ provider, apiKey: localApiKey.trim() }),
        });
        
        if (!saveResponse.ok) {
          throw new Error('Failed to save API key for testing');
        }
      }
      
      // Now test the connection via backend (using either newly saved or previously stored key)
      const testResponse = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });
      
      const result = await testResponse.json();
      
      setTestResults(prev => ({ ...prev, [provider]: result.success }));
      
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${provider.toUpperCase()} API.`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: `${result.error || 'Failed to connect to API'}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [provider]: false }));
      toast({
        title: "Connection Error",
        description: `Error testing ${provider.toUpperCase()} connection: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const getConnectionStatus = (provider: AIProvider) => {
    const hasLocalKey = !!config.apiKeys[provider];
    const testResult = testResults[provider];
    
    // If we have a local key being entered, show that status
    if (hasLocalKey) {
      if (testResult === true) return { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: "Connected" };
      if (testResult === false) return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: "Failed" };
      return { icon: <Key className="w-4 h-4 text-blue-500" />, text: "Ready to test" };
    }
    
    // Otherwise, show status based on backend data
    if (testResult === null) return { icon: <Key className="w-4 h-4 text-yellow-500" />, text: "Key stored" };
    if (testResult === true) return { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: "Connected" };
    if (testResult === false) return { icon: <Key className="w-4 h-4 text-muted-foreground" />, text: "No API key" };
    return { icon: <Key className="w-4 h-4 text-muted-foreground" />, text: "No API key" };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
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
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Configure your AI providers and preferences</p>
          </div>
        </div>

        {/* AI Provider Configuration */}
        <Card className="bg-brand-surface border-brand-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-brand-primary" />
              AI Provider Configuration
            </CardTitle>
            <CardDescription>
              Choose your preferred AI provider and configure API keys for agent functionality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select AI Provider</Label>
              <RadioGroup
                value={config.provider}
                onValueChange={(value: AIProvider) => 
                  setConfig(prev => ({ ...prev, provider: value }))
                }
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                data-testid="radio-group-ai-provider"
              >
                <div className="flex items-center space-x-2 p-4 border border-brand-border rounded-lg hover:bg-brand-muted/30">
                  <RadioGroupItem value="openai" id="openai" data-testid="radio-openai" />
                  <Label htmlFor="openai" className="flex-1 cursor-pointer">
                    <div className="font-medium">OpenAI</div>
                    <div className="text-sm text-muted-foreground">GPT-4, GPT-5 models</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border border-brand-border rounded-lg hover:bg-brand-muted/30">
                  <RadioGroupItem value="gemini" id="gemini" data-testid="radio-gemini" />
                  <Label htmlFor="gemini" className="flex-1 cursor-pointer">
                    <div className="font-medium">Google Gemini</div>
                    <div className="text-sm text-muted-foreground">Gemini 2.5 models</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border border-brand-border rounded-lg hover:bg-brand-muted/30">
                  <RadioGroupItem value="anthropic" id="anthropic" data-testid="radio-anthropic" />
                  <Label htmlFor="anthropic" className="flex-1 cursor-pointer">
                    <div className="font-medium">Anthropic</div>
                    <div className="text-sm text-muted-foreground">Claude 4 models</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* API Key Configuration */}
            <div className="space-y-4">
              <Label className="text-base font-medium">API Keys</Label>
              
              {/* OpenAI API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="openai-key" className="flex items-center gap-2">
                    OpenAI API Key
                    {getConnectionStatus('openai').icon}
                    <span className="text-sm text-muted-foreground">
                      {getConnectionStatus('openai').text}
                    </span>
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('openai')}
                    disabled={testingProvider === 'openai' || (!config.apiKeys.openai && testResults.openai === false)}
                    className="text-xs"
                    data-testid="button-test-openai"
                  >
                    {testingProvider === 'openai' ? 'Testing...' : 'Test'}
                  </Button>
                </div>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={config.apiKeys.openai || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    apiKeys: { ...prev.apiKeys, openai: e.target.value }
                  }))}
                  data-testid="input-openai-key"
                />
              </div>

              {/* Gemini API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gemini-key" className="flex items-center gap-2">
                    Gemini API Key
                    {getConnectionStatus('gemini').icon}
                    <span className="text-sm text-muted-foreground">
                      {getConnectionStatus('gemini').text}
                    </span>
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('gemini')}
                    disabled={testingProvider === 'gemini' || (!config.apiKeys.gemini && testResults.gemini === false)}
                    className="text-xs"
                    data-testid="button-test-gemini"
                  >
                    {testingProvider === 'gemini' ? 'Testing...' : 'Test'}
                  </Button>
                </div>
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="AIza..."
                  value={config.apiKeys.gemini || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    apiKeys: { ...prev.apiKeys, gemini: e.target.value }
                  }))}
                  data-testid="input-gemini-key"
                />
              </div>

              {/* Anthropic API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="anthropic-key" className="flex items-center gap-2">
                    Anthropic API Key
                    {getConnectionStatus('anthropic').icon}
                    <span className="text-sm text-muted-foreground">
                      {getConnectionStatus('anthropic').text}
                    </span>
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('anthropic')}
                    disabled={testingProvider === 'anthropic' || (!config.apiKeys.anthropic && testResults.anthropic === false)}
                    className="text-xs"
                    data-testid="button-test-anthropic"
                  >
                    {testingProvider === 'anthropic' ? 'Testing...' : 'Test'}
                  </Button>
                </div>
                <Input
                  id="anthropic-key"
                  type="password"
                  placeholder="sk-ant-..."
                  value={config.apiKeys.anthropic || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    apiKeys: { ...prev.apiKeys, anthropic: e.target.value }
                  }))}
                  data-testid="input-anthropic-key"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={saveConfig}
                className="bg-brand-primary hover:bg-brand-primary/90"
                data-testid="button-save-settings"
              >
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-brand-surface border-brand-border mt-6">
          <CardHeader>
            <CardTitle className="text-lg">How to get API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">OpenAI:</strong> Visit{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" 
                 className="text-brand-primary hover:underline">
                platform.openai.com/api-keys
              </a>{" "}
              to create an API key that starts with "sk-"
            </div>
            <div>
              <strong className="text-foreground">Google Gemini:</strong> Visit{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                 className="text-brand-primary hover:underline">
                aistudio.google.com/app/apikey
              </a>{" "}
              to create an API key that starts with "AIza"
            </div>
            <div>
              <strong className="text-foreground">Anthropic:</strong> Visit{" "}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                 className="text-brand-primary hover:underline">
                console.anthropic.com/settings/keys
              </a>{" "}
              to create an API key that starts with "sk-ant-"
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;