// Validation utilities

/**
 * Check if a file type is allowed
 */
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    
    // Documents
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
    
    // Code files
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'text/x-javascript',
    'application/json',
    'application/xml',
    'text/xml',

    // Programming languages
    'text/x-python',
    'application/x-python-code',
    'text/x-java-source',
    'text/x-c',
    'text/x-c++',
    'text/x-csharp',
    'text/x-php',
    'text/x-ruby',
    'text/x-go',
    'text/x-rust',
    'text/x-typescript',
    'application/typescript',
    'text/x-sql',
    'application/sql',
    'text/x-sh',
    'application/x-sh',
    'text/x-yaml',
    'application/x-yaml',
    'text/yaml',
    'application/yaml',
    
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    
    // Video
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    
    // Other
    'application/octet-stream',
  ];
  
  return allowedTypes.includes(mimeType);
}

/**
 * Get file extension from mime type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'text/markdown': 'md',
    'application/json': 'json',
    'application/xml': 'xml',
    'text/xml': 'xml',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };
  
  return mimeToExt[mimeType] || 'bin';
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Validate expiry hours
 */
export function isValidExpiryHours(hours: number, maxHours: number): boolean {
  return hours > 0 && hours <= maxHours;
}

/**
 * Calculate expiry date
 */
export function calculateExpiryDate(hours: number): string {
  const now = new Date();
  const expiry = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return expiry.toISOString();
}

/**
 * Check if a record is expired
 */
export function isExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  // Try various headers that might contain the real IP
  const headers = [
    'CF-Connecting-IP',
    'X-Forwarded-For',
    'X-Real-IP',
    'X-Client-IP',
  ];
  
  for (const header of headers) {
    const ip = request.headers.get(header);
    if (ip) {
      // If X-Forwarded-For, take the first IP
      return ip.split(',')[0].trim();
    }
  }
  
  return 'unknown';
}
