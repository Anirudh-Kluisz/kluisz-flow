// AI Response service using direct HTTP calls for immediate functionality
import { aiProviderService } from './aiProviderService';

interface AIResponseOptions {
  temperature?: number;
  max_tokens?: number;
  responseFormat?: 'text' | 'json';
}

export class AIResponseService {
  async generateResponse(
    provider: 'openai' | 'gemini' | 'anthropic',
    prompt: string,
    options: AIResponseOptions = {}
  ): Promise<string> {
    const { responseFormat = 'text' } = options;

    try {
      switch (provider) {
        case 'openai':
          return await this.generateOpenAIResponse(prompt, responseFormat);
        case 'gemini':
          return await this.generateGeminiResponse(prompt, responseFormat);
        case 'anthropic':
          return await this.generateAnthropicResponse(prompt, responseFormat);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating response with ${provider}:`, error);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  private async generateOpenAIResponse(prompt: string, responseFormat: string): Promise<string> {
    const apiKey = aiProviderService.getApiKey('openai') || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please configure it in settings.');
    }

    const messages = [{ role: "user", content: prompt }];
    
    const requestBody: any = {
      model: "gpt-4o", // Using GPT-4o (closest to GPT-5)
      messages,
      max_tokens: 2000,
    };

    // Add JSON format if requested
    if (responseFormat === 'json') {
      requestBody.response_format = { type: "json_object" };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content || '';
  }

  private async generateGeminiResponse(prompt: string, responseFormat: string): Promise<string> {
    const apiKey = aiProviderService.getApiKey('gemini') || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please configure it in settings.');
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.3,
      }
    };

    // Use Gemini 2.5 Flash model via REST API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  }

  private async generateAnthropicResponse(prompt: string, responseFormat: string): Promise<string> {
    const apiKey = aiProviderService.getApiKey('anthropic') || process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('Anthropic API key not found. Please configure it in settings.');
    }

    const requestBody = {
      model: "claude-3-5-sonnet-20241022", // Using latest Claude model
      max_tokens: 4000,
      system: "You are a helpful AI assistant that provides clear, well-structured responses in plain text format.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ]
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    // Robust parsing of Claude response content
    // Claude returns an array of content blocks, we need to extract text from them
    if (data.content && Array.isArray(data.content)) {
      const textBlocks = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n\n');
      
      if (textBlocks) {
        return textBlocks;
      }
    }
    
    // Fallback for other response formats
    if (data.content?.[0]?.text) {
      return data.content[0].text;
    }
    
    // Last resort fallback
    throw new Error('Unexpected Claude response format: no text content found');
  }

  async testProviderConnection(provider: 'openai' | 'gemini' | 'anthropic'): Promise<boolean> {
    try {
      const testPrompt = "Hello, please respond with 'OK' to confirm connection.";
      const response = await this.generateResponse(provider, testPrompt);
      return response.toLowerCase().includes('ok');
    } catch (error) {
      console.error(`Connection test failed for ${provider}:`, error);
      return false;
    }
  }

  getAvailableProviders(): ('openai' | 'gemini' | 'anthropic')[] {
    const providers: ('openai' | 'gemini' | 'anthropic')[] = [];
    
    if (aiProviderService.getApiKey('openai') || process.env.OPENAI_API_KEY) {
      providers.push('openai');
    }
    
    if (aiProviderService.getApiKey('gemini') || process.env.GEMINI_API_KEY) {
      providers.push('gemini');
    }
    
    if (aiProviderService.getApiKey('anthropic') || process.env.ANTHROPIC_API_KEY) {
      providers.push('anthropic');
    }
    
    return providers;
  }
}

export const aiResponseService = new AIResponseService();