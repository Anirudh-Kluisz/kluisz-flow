// AI Provider Service for secure API key management and testing
// From javascript_openai integration
// From javascript_gemini integration  
// From javascript_anthropic integration

export type AIProvider = 'openai' | 'gemini' | 'anthropic';

interface AIConfig {
  provider: AIProvider | null;
  hasKeys: {
    openai: boolean;
    gemini: boolean;
    anthropic: boolean;
  };
}

interface TestResult {
  success: boolean;
  error?: string;
}

class AIProviderService {
  private apiKeys: Map<AIProvider, string> = new Map();
  private selectedProvider: AIProvider | null = null;

  async saveApiKey(provider: AIProvider, apiKey: string): Promise<void> {
    // In a production environment, you would encrypt this or use secure storage
    // For development, we'll store in memory with the option to persist to encrypted file
    this.apiKeys.set(provider, apiKey);
    
    // Auto-select the provider if it's the first one configured
    if (!this.selectedProvider) {
      this.selectedProvider = provider;
    }
  }

  async testConnection(provider: AIProvider): Promise<TestResult> {
    const apiKey = this.apiKeys.get(provider);
    
    if (!apiKey) {
      return {
        success: false,
        error: 'API key not found. Please save your API key first.'
      };
    }

    try {
      switch (provider) {
        case 'openai':
          return await this.testOpenAI(apiKey);
        case 'gemini':
          return await this.testGemini(apiKey);
        case 'anthropic':
          return await this.testAnthropic(apiKey);
        default:
          return {
            success: false,
            error: 'Unknown provider'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Connection test failed: ${error.message}`
      };
    }
  }

  private async testOpenAI(apiKey: string): Promise<TestResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.text();
        return {
          success: false,
          error: `OpenAI API error: ${response.status} - ${error}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `OpenAI connection failed: ${error.message}`
      };
    }
  }

  private async testGemini(apiKey: string): Promise<TestResult> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.text();
        return {
          success: false,
          error: `Gemini API error: ${response.status} - ${error}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Gemini connection failed: ${error.message}`
      };
    }
  }

  private async testAnthropic(apiKey: string): Promise<TestResult> {
    try {
      // Test with a minimal request to verify the API key
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });

      if (response.ok || response.status === 400) {
        // 400 is expected for minimal request, but means API key is valid
        return { success: true };
      } else {
        const error = await response.text();
        return {
          success: false,
          error: `Anthropic API error: ${response.status} - ${error}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Anthropic connection failed: ${error.message}`
      };
    }
  }

  async getConfiguration(): Promise<AIConfig> {
    return {
      provider: this.selectedProvider,
      hasKeys: {
        openai: this.apiKeys.has('openai'),
        gemini: this.apiKeys.has('gemini'),
        anthropic: this.apiKeys.has('anthropic')
      }
    };
  }

  async setProvider(provider: AIProvider): Promise<void> {
    if (this.apiKeys.has(provider)) {
      this.selectedProvider = provider;
    } else {
      throw new Error(`No API key found for ${provider}`);
    }
  }

  getApiKey(provider: AIProvider): string | undefined {
    return this.apiKeys.get(provider);
  }

  getCurrentProvider(): AIProvider | null {
    return this.selectedProvider;
  }
}

export const aiProviderService = new AIProviderService();