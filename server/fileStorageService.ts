import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { ObjectStorageService } from './objectStorage';

interface UploadedFileInfo {
  id: string;
  name: string;
  size: number;
  path: string;
  uploadedAt: Date;
  mimeType?: string;
}

// Fallback local file storage when Object Storage isn't configured
class LocalFileStorageService {
  private uploadDir: string;
  private metadataFile: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'uploads');
    this.metadataFile = join(this.uploadDir, 'metadata.json');
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getMetadata(): UploadedFileInfo[] {
    try {
      if (existsSync(this.metadataFile)) {
        const data = readFileSync(this.metadataFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading metadata:', error);
    }
    return [];
  }

  saveMetadata(metadata: UploadedFileInfo[]) {
    writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));
  }

  async generateUploadURL(): Promise<string> {
    const fileId = randomUUID();
    return `http://localhost:3001/api/files/local-upload/${fileId}`;
  }

  async saveUploadedFile(fileId: string, buffer: Buffer, fileName: string, mimeType?: string): Promise<UploadedFileInfo> {
    const filePath = join(this.uploadDir, `${fileId}-${fileName}`);
    writeFileSync(filePath, buffer);
    
    const fileInfo: UploadedFileInfo = {
      id: fileId,
      name: fileName,
      size: buffer.length,
      path: `/uploads/${fileId}-${fileName}`,
      uploadedAt: new Date(),
      mimeType
    };

    const metadata = this.getMetadata();
    metadata.push(fileInfo);
    this.saveMetadata(metadata);

    return fileInfo;
  }

  async getFileInfo(fileId: string): Promise<UploadedFileInfo | null> {
    const metadata = this.getMetadata();
    return metadata.find(file => file.id === fileId) || null;
  }

  async getAllFiles(): Promise<UploadedFileInfo[]> {
    return this.getMetadata();
  }

  async serveFile(filePath: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    try {
      const fullPath = join(this.uploadDir, filePath.replace('/uploads/', ''));
      if (existsSync(fullPath)) {
        const buffer = readFileSync(fullPath);
        const contentType = this.getMimeType(fullPath);
        return { buffer, contentType };
      }
    } catch (error) {
      console.error('Error serving file:', error);
    }
    return null;
  }

  private getMimeType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword',
      'txt': 'text/plain',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

// Unified file storage service that tries Object Storage first, falls back to local
export class FileStorageService {
  private localStorage: LocalFileStorageService;
  private objectStorage: ObjectStorageService | null = null;

  constructor() {
    this.localStorage = new LocalFileStorageService();
    
    // Try to initialize Object Storage if environment variables are set
    try {
      if (process.env.PRIVATE_OBJECT_DIR && process.env.PUBLIC_OBJECT_SEARCH_PATHS) {
        this.objectStorage = new ObjectStorageService();
      }
    } catch (error) {
      console.log('Object Storage not available, using local storage fallback');
    }
  }

  async generateUploadURL(): Promise<{ uploadURL: string; useObjectStorage: boolean }> {
    if (this.objectStorage) {
      try {
        const uploadURL = await this.objectStorage.getObjectEntityUploadURL();
        return { uploadURL, useObjectStorage: true };
      } catch (error) {
        console.error('Object Storage upload URL generation failed:', error);
      }
    }
    
    // Fallback to local storage
    const uploadURL = await this.localStorage.generateUploadURL();
    return { uploadURL, useObjectStorage: false };
  }

  async completeUpload(fileUrl: string, fileName: string, fileSize: number, useObjectStorage: boolean): Promise<UploadedFileInfo> {
    if (useObjectStorage && this.objectStorage) {
      try {
        const objectPath = await this.objectStorage.trySetObjectEntityAclPolicy(
          fileUrl,
          {
            owner: 'system',
            visibility: 'public',
          }
        );

        // Extract stable ID from object key for deduplication
        const objectKey = this.extractObjectKeyFromUrl(fileUrl);
        const fileId = objectKey || randomUUID();

        const fileInfo: UploadedFileInfo = {
          id: fileId,
          name: fileName,
          size: fileSize,
          path: objectPath,
          uploadedAt: new Date(),
          mimeType: this.detectMimeTypeFromFileName(fileName)
        };

        return fileInfo;
      } catch (error) {
        console.error('Object Storage completion failed:', error);
        throw error;
      }
    }

    // This should not happen in normal flow for local storage
    // as local uploads are handled directly in the upload endpoint
    throw new Error('Invalid upload completion for local storage');
  }

  private extractObjectKeyFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1] || null;
    } catch {
      return null;
    }
  }

  private detectMimeTypeFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  }

  async getAllFiles(): Promise<UploadedFileInfo[]> {
    // For now, only return local files
    // In a full implementation, we'd also query Object Storage metadata
    return await this.localStorage.getAllFiles();
  }

  async serveFile(filePath: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    if (filePath.startsWith('/uploads/')) {
      return await this.localStorage.serveFile(filePath);
    }
    
    // For Object Storage files, we'd proxy the request
    // For now, return null to indicate not found
    return null;
  }

  // Local storage specific methods
  async saveLocalFile(fileId: string, buffer: Buffer, fileName: string, mimeType?: string): Promise<UploadedFileInfo> {
    return await this.localStorage.saveUploadedFile(fileId, buffer, fileName, mimeType);
  }

  // Persist Object Storage metadata to local metadata for unified file listing
  async persistObjectStorageMetadata(fileInfo: UploadedFileInfo): Promise<void> {
    const metadata = this.localStorage.getMetadata();
    
    // Check for existing entry with same ID to avoid duplicates
    const existingIndex = metadata.findIndex(file => file.id === fileInfo.id);
    if (existingIndex >= 0) {
      // Update existing entry
      metadata[existingIndex] = fileInfo;
    } else {
      // Add new entry
      metadata.push(fileInfo);
    }
    
    this.localStorage.saveMetadata(metadata);
  }
}