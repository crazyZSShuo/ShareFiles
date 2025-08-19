// R2 Storage service for file operations

export class StorageService {
  constructor(private bucket: R2Bucket) {}

  /**
   * Upload a file to R2 storage
   */
  async uploadFile(
    key: string, 
    data: ArrayBuffer | ReadableStream, 
    metadata?: Record<string, string>
  ): Promise<void> {
    const options: R2PutOptions = {};
    
    if (metadata) {
      options.customMetadata = metadata;
    }
    
    await this.bucket.put(key, data, options);
  }

  /**
   * Download a file from R2 storage
   */
  async downloadFile(key: string): Promise<R2ObjectBody | null> {
    const object = await this.bucket.get(key);
    return object;
  }

  /**
   * Delete a file from R2 storage
   */
  async deleteFile(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  /**
   * Check if a file exists in R2 storage
   */
  async fileExists(key: string): Promise<boolean> {
    const object = await this.bucket.head(key);
    return object !== null;
  }

  /**
   * Get file metadata from R2 storage
   */
  async getFileMetadata(key: string): Promise<R2Object | null> {
    const object = await this.bucket.head(key);
    return object;
  }

  /**
   * Generate a presigned URL for direct upload (if needed in the future)
   */
  generateUploadUrl(key: string, expiresIn: number = 3600): string {
    // Note: R2 doesn't support presigned URLs in the same way as S3
    // This is a placeholder for future implementation
    throw new Error('Presigned URLs not implemented for R2');
  }

  /**
   * List files with a prefix (for admin purposes)
   */
  async listFiles(prefix?: string, limit: number = 1000): Promise<R2Objects> {
    const options: R2ListOptions = {
      limit,
    };
    
    if (prefix) {
      options.prefix = prefix;
    }
    
    return await this.bucket.list(options);
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{ totalFiles: number; totalSize: number }> {
    const objects = await this.listFiles();
    
    let totalFiles = 0;
    let totalSize = 0;
    
    for (const object of objects.objects) {
      totalFiles++;
      totalSize += object.size;
    }
    
    return { totalFiles, totalSize };
  }

  /**
   * Cleanup orphaned files (files in storage but not in database)
   */
  async cleanupOrphanedFiles(validFileIds: string[]): Promise<number> {
    const objects = await this.listFiles();
    let deletedCount = 0;
    
    for (const object of objects.objects) {
      const fileId = object.key.split('.')[0]; // Extract ID from filename
      
      if (!validFileIds.includes(fileId)) {
        await this.deleteFile(object.key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
}
