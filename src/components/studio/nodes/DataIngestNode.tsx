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
  AlertCircle
} from 'lucide-react';
import { ObjectUploader } from '@/components/ObjectUploader';
import type { UploadResult } from '@uppy/core';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  name: string;
  path: string;
  size: number;
  uploadedAt: Date;
}

export const DataIngestNode = memo(({ data, selected }: NodeProps) => {
  const nodeLabel = String(data?.label || 'PDF & Document Ingest');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load previously uploaded files on component mount
  useEffect(() => {
    const loadUploadedFiles = async () => {
      try {
        const response = await fetch('/api/files');
        if (response.ok) {
          const files: UploadedFile[] = await response.json();
          setUploadedFiles(files.map(file => ({
            ...file,
            uploadedAt: new Date(file.uploadedAt)
          })));
        }
      } catch (error) {
        console.error('Error loading uploaded files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUploadedFiles();
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
            name: fileInfo.name,
            path: fileInfo.path,
            size: fileInfo.size,
            uploadedAt: new Date(),
          };
          
          setUploadedFiles(prev => [...prev, newFile]);
        } else {
          // For local storage, the file info is returned directly from the upload endpoint
          if (uploadedFile.response && uploadedFile.response.body) {
            const responseData = JSON.parse(String(uploadedFile.response.body));
            if (responseData.fileInfo) {
              const newFile: UploadedFile = {
                name: responseData.fileInfo.name,
                path: responseData.fileInfo.path,
                size: responseData.fileInfo.size,
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
          
          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Uploaded Files ({uploadedFiles.length})
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded border text-xs"
                    data-testid={`file-item-${index}`}
                  >
                    <FileText className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{file.name}</div>
                      <div className="text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
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