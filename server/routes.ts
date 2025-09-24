import { Express } from 'express';
import { aiProviderService } from './services/aiProviderService';
import { ObjectStorageService, ObjectNotFoundError } from './objectStorage';
import { FileStorageService } from './fileStorageService';
import { PDFProcessingService } from './services/pdfProcessingService';
import { caseStudyAnalysisService } from './services/caseStudyAnalysisService';
import { documentGenerationService } from './services/documentGenerationService';
import { aiResponseService } from './services/aiResponseService';

export function registerRoutes(app: Express) {
  const fileStorageService = new FileStorageService();
  const pdfProcessingService = new PDFProcessingService();
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

  // File Upload endpoints for DataIngest functionality
  app.post('/api/files/upload', async (req, res) => {
    try {
      const { uploadURL, useObjectStorage } = await fileStorageService.generateUploadURL();
      res.json({ uploadURL, useObjectStorage });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ error: 'Failed to get upload URL' });
    }
  });

  app.post('/api/files/complete-upload', async (req, res) => {
    try {
      const { fileUrl, fileName, fileSize, useObjectStorage } = req.body;
      
      if (!fileUrl || !fileName) {
        return res.status(400).json({ error: 'File URL and name are required' });
      }

      // Server-side validation for Object Storage uploads
      if (fileSize > 50 * 1024 * 1024) {
        return res.status(413).json({ error: 'File size exceeds 50MB limit' });
      }

      const fileInfo = await fileStorageService.completeUpload(fileUrl, fileName, fileSize, useObjectStorage);
      
      // Persist Object Storage uploads to metadata as well
      if (useObjectStorage) {
        await fileStorageService.persistObjectStorageMetadata(fileInfo);
      }

      res.json({
        success: true,
        message: 'File uploaded successfully',
        fileInfo
      });
    } catch (error) {
      console.error('Error completing file upload:', error);
      res.status(500).json({ error: 'Failed to complete file upload' });
    }
  });

  // Local file upload endpoint (when Object Storage is not available)
  app.put('/api/files/local-upload/:fileId', async (req, res) => {
    try {
      const fileId = req.params.fileId;
      
      // Extract filename and content type from headers
      const contentType = req.headers['content-type'] || 'application/octet-stream';
      const fileName = req.headers['x-file-name'] as string || `upload-${Date.now()}`;
      const fileSize = parseInt(req.headers['x-file-size'] as string || '0');
      
      // Server-side validation
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(contentType)) {
        return res.status(400).json({ 
          error: 'Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.' 
        });
      }
      
      // Check file size before processing
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (fileSize > maxSize) {
        return res.status(413).json({ error: 'File size exceeds 50MB limit' });
      }
      
      // Collect raw buffer data with size limit
      let totalSize = 0;
      const chunks: Buffer[] = [];
      let streamEnded = false;
      
      req.on('data', (chunk) => {
        if (streamEnded) return;
        
        totalSize += chunk.length;
        if (totalSize > maxSize) {
          streamEnded = true;
          req.removeAllListeners();
          return res.status(413).json({ error: 'File size exceeds 50MB limit' });
        }
        chunks.push(chunk);
      });
      
      req.on('end', async () => {
        if (streamEnded) return;
        
        try {
          const buffer = Buffer.concat(chunks);
          
          if (buffer.length === 0) {
            return res.status(400).json({ error: 'No file data received' });
          }
          
          const fileInfo = await fileStorageService.saveLocalFile(
            fileId,
            buffer,
            fileName,
            contentType
          );

          res.json({
            success: true,
            message: 'File uploaded successfully',
            fileInfo
          });
        } catch (error) {
          console.error('Error processing upload:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'File processing failed' });
          }
        }
      });
      
      req.on('error', (error) => {
        console.error('Upload stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Upload failed' });
        }
      });
    } catch (error) {
      console.error('Error in local file upload:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'File upload failed' });
      }
    }
  });

  // Get all uploaded files for a DataIngest node
  app.get('/api/files', async (req, res) => {
    try {
      const files = await fileStorageService.getAllFiles();
      res.json(files);
    } catch (error) {
      console.error('Error getting files:', error);
      res.status(500).json({ error: 'Failed to get files' });
    }
  });

  // Serve uploaded files
  app.get('/uploads/:fileName', async (req, res) => {
    try {
      const filePath = `/uploads/${req.params.fileName}`;
      const fileData = await fileStorageService.serveFile(filePath);
      
      if (!fileData) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.setHeader('Content-Type', fileData.contentType);
      res.send(fileData.buffer);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ error: 'Failed to serve file' });
    }
  });

  // Serve Object Storage files (when available)
  app.use('/objects', async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('Error serving object storage file:', error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Case Study Analysis Workflow endpoints
  
  // Complete end-to-end case study analysis workflow
  app.post('/api/case-study/complete-analysis', async (req, res) => {
    try {
      const { fileId, fileName, provider = 'openai' } = req.body;
      
      if (!fileId || !fileName) {
        return res.status(400).json({ error: 'File ID and name are required' });
      }

      console.log(`Starting complete case study analysis for ${fileName}`);

      // Step 1: Extract text from PDF
      const extractedContent = await pdfProcessingService.extractTextFromPDF(fileId, fileName);
      console.log('PDF text extracted successfully');

      // Step 2: Analyze with AI
      const analysis = await caseStudyAnalysisService.analyzeCaseStudy(
        extractedContent.text,
        fileName,
        provider
      );
      console.log('AI analysis completed');

      // Step 3: Generate document
      const documentPath = await documentGenerationService.generateCaseStudyDocument(
        analysis,
        fileName,
        provider
      );
      console.log('Document generated successfully');

      // Step 4: Generate slide content
      const slideContent = await documentGenerationService.generateSlideContent(analysis);
      
      res.json({
        success: true,
        analysis,
        documentPath,
        slideContent,
        extractedContent: extractedContent.metadata,
        provider,
        message: 'Complete case study analysis workflow completed successfully'
      });
    } catch (error) {
      console.error('Error in complete analysis workflow:', error);
      res.status(500).json({ 
        error: `Complete analysis failed: ${error.message}`,
        step: 'unknown'
      });
    }
  });

  // Get available AI providers
  app.get('/api/case-study/providers', async (req, res) => {
    try {
      const availableProviders = aiResponseService.getAvailableProviders();
      const providerConfig = aiProviderService.getConfiguration();
      
      res.json({
        success: true,
        availableProviders,
        currentProvider: aiProviderService.getCurrentProvider(),
        providerConfig
      });
    } catch (error) {
      console.error('Error getting providers:', error);
      res.status(500).json({ error: 'Failed to get provider information' });
    }
  });

  // List generated documents
  app.get('/api/case-study/documents', async (req, res) => {
    try {
      const documents = await documentGenerationService.listGeneratedDocuments();
      
      res.json({
        success: true,
        documents
      });
    } catch (error) {
      console.error('Error listing documents:', error);
      res.status(500).json({ error: 'Failed to list generated documents' });
    }
  });

  // Execute complete workflow analysis
  app.post('/api/case-study/run-workflow', async (req, res) => {
    try {
      const { workflowId, nodes } = req.body;
      
      // Find DataIngest nodes in the workflow
      const dataIngestNodes = nodes.filter((node: any) => node.type === 'dataIngest');
      if (dataIngestNodes.length === 0) {
        return res.status(400).json({ error: 'No DataIngest nodes found in workflow' });
      }
      
      // Get all uploaded files
      const allFiles = await fileStorageService.getAllFiles();
      if (allFiles.length === 0) {
        return res.status(400).json({ error: 'No files uploaded for analysis' });
      }
      
      // Get available providers
      const availableProviders = aiResponseService.getAvailableProviders();
      if (availableProviders.length === 0) {
        return res.status(400).json({ error: 'No AI providers configured' });
      }
      
      const provider = availableProviders[0]; // Use first available provider
      const results = [];
      let documentsCreated = 0;
      
      // Process each PDF file
      for (const file of allFiles) {
        if (file.mimeType === 'application/pdf') {
          try {
            console.log(`Processing file: ${file.name} with provider: ${provider}`);
            
            // Run complete case study analysis
            const result = await caseStudyAnalysisService.runCompleteAnalysis(
              file.id,
              file.name,
              provider
            );
            
            results.push({
              fileId: file.id,
              fileName: file.name,
              provider,
              documentPath: result.documentPath,
              slideContent: result.slideContent,
              analysis: result.analysis
            });
            
            documentsCreated++;
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            results.push({
              fileId: file.id,
              fileName: file.name,
              provider,
              error: error.message
            });
          }
        }
      }
      
      res.json({
        success: true,
        workflowId,
        documentsCreated,
        totalFiles: allFiles.length,
        provider,
        results,
        message: `Workflow completed! Generated ${documentsCreated} analysis documents.`
      });
    } catch (error) {
      console.error('Error running workflow:', error);
      res.status(500).json({ error: 'Workflow execution failed' });
    }
  });
}