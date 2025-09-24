import { Express } from 'express';
import { aiProviderService } from './services/aiProviderService';

export function registerRoutes(app: Express) {
  // AI Provider Configuration endpoints
  app.post('/api/ai-providers/save', async (req, res) => {
    try {
      const { provider, apiKey } = req.body;
      
      if (!provider || !apiKey) {
        return res.status(400).json({ 
          error: 'Provider and API key are required' 
        });
      }

      // Save the API key securely (in memory for now, could be encrypted file or secure storage)
      await aiProviderService.saveApiKey(provider, apiKey);
      
      res.json({ 
        success: true, 
        message: `${provider} API key saved successfully` 
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      res.status(500).json({ error: 'Failed to save API key' });
    }
  });

  app.post('/api/ai-providers/test', async (req, res) => {
    try {
      const { provider } = req.body;
      
      if (!provider) {
        return res.status(400).json({ error: 'Provider is required' });
      }

      const result = await aiProviderService.testConnection(provider);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: `Successfully connected to ${provider}` 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Error testing API connection:', error);
      res.status(500).json({ error: 'Failed to test API connection' });
    }
  });

  app.post('/api/ai-providers/set-provider', async (req, res) => {
    try {
      const { provider } = req.body;
      
      if (!provider) {
        return res.status(400).json({ error: 'Provider is required' });
      }

      await aiProviderService.setProvider(provider);
      
      res.json({ 
        success: true, 
        message: `${provider} set as active provider` 
      });
    } catch (error) {
      console.error('Error setting provider:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/ai-providers/config', async (req, res) => {
    try {
      const config = await aiProviderService.getConfiguration();
      res.json(config);
    } catch (error) {
      console.error('Error getting configuration:', error);
      res.status(500).json({ error: 'Failed to get configuration' });
    }
  });
}