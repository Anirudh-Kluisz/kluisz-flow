import { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Brain,
  Settings,
  Download,
  Trash2
} from 'lucide-react';
import { ObjectUploader } from '@/components/ObjectUploader';
import type { UploadResult } from '@uppy/core';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UploadedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  uploadedAt: Date;
  mimeType?: string;
}

interface AnalysisResult {
  analysis: any;
  documentPath: string;
  slideContent: string;
  provider: string;
}

export const DataIngestNode = memo(({ data, selected }: NodeProps) => {
  const nodeLabel = String(data?.label || 'PDF & Document Ingest');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<Map<string, AnalysisResult>>(new Map());
  const { toast } = useToast();

  // Load previously uploaded files and available providers on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load uploaded files
        const filesResponse = await fetch('/api/files');
        if (filesResponse.ok) {
          const files: any[] = await filesResponse.json();
          setUploadedFiles(files.map(file => ({
            id: file.id || file.name, // Use file.id if available, fallback to name
            name: file.name,
            path: file.path,
            size: file.size,
            mimeType: file.mimeType,
            uploadedAt: new Date(file.uploadedAt)
          })));
        }

        // Load available AI providers
        const providersResponse = await fetch('/api/case-study/providers');
        if (providersResponse.ok) {
          const { availableProviders, currentProvider } = await providersResponse.json();
          setAvailableProviders(availableProviders);
          if (currentProvider) {
            setSelectedProvider(currentProvider);
          } else if (availableProviders.length > 0) {
            setSelectedProvider(availableProviders[0]);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  const handleGetUploadParameters = async () => {
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }
    
    const { uploadURL, useObjectStorage } = await response.json();
    
    // Store useObjectStorage flag for completion
    (window as any).__uploadContext = { useObjectStorage };
    
    return {
      method: 'PUT' as const,
      url: uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    setIsUploading(true);
    
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadContext = (window as any).__uploadContext || {};
        
        if (uploadContext.useObjectStorage) {
          // Complete the upload process for Object Storage
          const completeResponse = await fetch('/api/files/complete-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileUrl: uploadedFile.uploadURL,
              fileName: uploadedFile.name,
              fileSize: uploadedFile.size,
              useObjectStorage: true,
            }),
          });
          
          if (!completeResponse.ok) {
            throw new Error('Failed to complete upload');
          }
          
          const { fileInfo } = await completeResponse.json();
          
          // Add to uploaded files list
          const newFile: UploadedFile = {
            id: fileInfo.id,
            name: fileInfo.name,
            path: fileInfo.path,
            size: fileInfo.size,
            mimeType: fileInfo.mimeType,
            uploadedAt: new Date(),
          };
          
          setUploadedFiles(prev => [...prev, newFile]);
        } else {
          // For local storage, the file info is returned directly from the upload endpoint
          if (uploadedFile.response && uploadedFile.response.body) {
            const responseData = JSON.parse(String(uploadedFile.response.body));
            if (responseData.fileInfo) {
              const newFile: UploadedFile = {
                id: responseData.fileInfo.id,
                name: responseData.fileInfo.name,
                path: responseData.fileInfo.path,
                size: responseData.fileInfo.size,
                mimeType: responseData.fileInfo.mimeType,
                uploadedAt: new Date(responseData.fileInfo.uploadedAt),
              };
              
              setUploadedFiles(prev => [...prev, newFile]);
            }
          }
        }
        
        toast({
          title: "File Uploaded",
          description: `Successfully uploaded ${uploadedFile.name}`,
        });
      }
    } catch (error) {
      console.error('Upload completion error:', error);
      toast({
        title: "Upload Failed",
        description: `Failed to complete upload: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCaseStudyAnalysis = async (fileId: string, fileName: string) => {
    if (!selectedProvider) {
      toast({
        title: "No AI Provider",
        description: "Please configure an AI provider in Settings first.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log(`Starting analysis for ${fileName} with ${selectedProvider}`);
      
      const response = await fetch('/api/case-study/complete-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          fileName,
          provider: selectedProvider
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      
      // Store analysis result
      setAnalysisResults(prev => new Map(prev.set(fileId, {
        analysis: result.analysis,
        documentPath: result.documentPath,
        slideContent: result.slideContent,
        provider: result.provider
      })));

      toast({
        title: "Analysis Complete",
        description: `Case study analysis completed successfully using ${selectedProvider.toUpperCase()}`,
      });

      console.log('Analysis completed:', result);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: `Failed to analyze case study: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadAnalysisResult = (fileId: string, fileName: string) => {
    const result = analysisResults.get(fileId);
    if (!result) return;

    // Create downloadable content
    const content = `CASE STUDY ANALYSIS: ${fileName}
===============================

${result.slideContent}

DETAILED ANALYSIS:
${JSON.stringify(result.analysis, null, 2)}

Generated by: ${result.provider.toUpperCase()}
Generated at: ${new Date().toLocaleString()}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.pdf', '')}_analysis.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <Card className={`
      w-80 bg-brand-surface border-2 transition-all duration-200
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
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-foreground">
              {nodeLabel}
            </h3>
            <Badge variant="outline" className="text-xs mt-1">
              DataIngest
            </Badge>
          </div>
        </div>
        
        {/* Upload Section */}
        <div className="space-y-3">
          <ObjectUploader
            maxNumberOfFiles={5}
            maxFileSize={50 * 1024 * 1024} // 50MB
            allowedFileTypes={['.pdf', '.docx', '.txt']}
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="w-full"
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload PDF/Documents</span>
            </div>
          </ObjectUploader>
          
          {/* AI Provider Selection */}
          {availableProviders.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                AI Analysis Provider
              </div>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-ai-provider">
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Uploaded Files ({uploadedFiles.length})
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="space-y-2 p-2 bg-muted/30 rounded border text-xs"
                    data-testid={`file-item-${index}`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{file.name}</div>
                        <div className="text-muted-foreground">
                          {formatFileSize(file.size)} • {file.mimeType || 'Unknown type'}
                        </div>
                      </div>
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    </div>
                    
                    {/* AI Analysis Controls for PDFs */}
                    {file.mimeType === 'application/pdf' && availableProviders.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleCaseStudyAnalysis(file.id, file.name)}
                          disabled={isAnalyzing}
                          data-testid={`button-analyze-${file.id}`}
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                        </Button>
                        
                        {analysisResults.has(file.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => downloadAnalysisResult(file.id, file.name)}
                            data-testid={`button-download-${file.id}`}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {/* Show analysis status */}
                    {analysisResults.has(file.id) && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs">Analysis completed with {analysisResults.get(file.id)?.provider.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Status Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Loading...</span>
                </>
              ) : isUploading ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Processing...</span>
                </>
              ) : uploadedFiles.length > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Ready</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Waiting for files</span>
                </>
              )}
            </div>
            
            {uploadedFiles.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
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