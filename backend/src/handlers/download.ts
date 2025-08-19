// File download handler

import { Hono } from 'hono';
import type { Env } from '@/types/env';
import type { DownloadFileRequest, FileInfoResponse } from '@/types/api';
import { downloadFileSchema, ErrorCodes } from '@/types/api';
import { DatabaseService } from '@/services/database';
import { StorageService } from '@/services/storage';
import { verifyPassword } from '@/utils/crypto';
import { isExpired } from '@/utils/validation';
import { successResponse, errorResponse, fileResponse } from '@/utils/response';

const download = new Hono<{ Bindings: Env }>();

// Get file info
download.get('/info/:id', async (c) => {
  try {
    const fileId = c.req.param('id');
    const dbService = new DatabaseService(c.env.DB);
    
    const file = await dbService.getFile(fileId);
    
    if (!file) {
      return errorResponse(ErrorCodes.FILE_NOT_FOUND, 'File not found', 404);
    }

    const accessibility = await dbService.isFileAccessible(file);
    
    const response: FileInfoResponse = {
      id: file.id,
      filename: file.filename,
      original_filename: file.original_filename,
      mime_type: file.mime_type,
      size: file.size,
      created_at: file.created_at,
      expires_at: file.expires_at,
      download_count: file.download_count,
      max_downloads: file.max_downloads,
      has_password: !!file.password_hash,
      is_expired: isExpired(file.expires_at),
      is_download_limit_reached: !accessibility.accessible && accessibility.reason === 'download_limit_reached',
    };

    return successResponse(response);

  } catch (error) {
    console.error('File info error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to get file info', 500);
  }
});

// Download file
download.post('/download/:id', async (c) => {
  try {
    const fileId = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    
    // Validate request
    const validationResult = downloadFileSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR, 
        'Invalid request parameters', 
        400, 
        validationResult.error.errors
      );
    }

    const { password } = validationResult.data;
    
    // Initialize services
    const dbService = new DatabaseService(c.env.DB);
    const storageService = new StorageService(c.env.BUCKET);
    
    // Get file record
    const file = await dbService.getFile(fileId);
    
    if (!file) {
      return errorResponse(ErrorCodes.FILE_NOT_FOUND, 'File not found', 404);
    }

    // Check accessibility
    const accessibility = await dbService.isFileAccessible(file);
    
    if (!accessibility.accessible) {
      if (accessibility.reason === 'expired') {
        return errorResponse(ErrorCodes.FILE_EXPIRED, 'File has expired', 410);
      } else if (accessibility.reason === 'download_limit_reached') {
        return errorResponse(ErrorCodes.DOWNLOAD_LIMIT_REACHED, 'Download limit reached', 403);
      }
    }

    // Check password if required
    if (file.password_hash) {
      if (!password) {
        return errorResponse(ErrorCodes.INVALID_PASSWORD, 'Password required', 401);
      }
      
      const isValidPassword = await verifyPassword(password, file.password_hash);
      if (!isValidPassword) {
        return errorResponse(ErrorCodes.INVALID_PASSWORD, 'Invalid password', 401);
      }
    }

    // Get file from storage
    const fileObject = await storageService.downloadFile(file.filename);
    
    if (!fileObject) {
      return errorResponse(ErrorCodes.FILE_NOT_FOUND, 'File not found in storage', 404);
    }

    // Increment download count
    await dbService.incrementDownloadCount(fileId);

    // Return file
    return fileResponse(
      fileObject.body,
      file.original_filename,
      file.mime_type,
      file.size
    );

  } catch (error) {
    console.error('Download error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to download file', 500);
  }
});

// Direct download (GET request for simple links)
download.get('/download/:id', async (c) => {
  try {
    const fileId = c.req.param('id');
    const password = c.req.query('password');
    
    // Initialize services
    const dbService = new DatabaseService(c.env.DB);
    const storageService = new StorageService(c.env.BUCKET);
    
    // Get file record
    const file = await dbService.getFile(fileId);
    
    if (!file) {
      return errorResponse(ErrorCodes.FILE_NOT_FOUND, 'File not found', 404);
    }

    // Check accessibility
    const accessibility = await dbService.isFileAccessible(file);

    if (!accessibility.accessible) {
      const frontendUrl = c.env.CORS_ORIGIN === '*' ? 'http://localhost:3001' : c.env.CORS_ORIGIN;

      if (accessibility.reason === 'expired') {
        return c.redirect(`${frontendUrl}/download/${fileId}?error=expired`, 302);
      } else if (accessibility.reason === 'download_limit_reached') {
        return c.redirect(`${frontendUrl}/download/${fileId}?error=download_limit_reached`, 302);
      }
    }

    // Check password if required
    if (file.password_hash) {
      if (!password) {
        // Redirect to download page instead of returning JSON error
        const frontendUrl = c.env.CORS_ORIGIN === '*' ? 'http://localhost:3001' : c.env.CORS_ORIGIN;
        return c.redirect(`${frontendUrl}/download/${fileId}`, 302);
      }

      const isValidPassword = await verifyPassword(password, file.password_hash);
      if (!isValidPassword) {
        // Redirect to download page with error parameter
        const frontendUrl = c.env.CORS_ORIGIN === '*' ? 'http://localhost:3001' : c.env.CORS_ORIGIN;
        return c.redirect(`${frontendUrl}/download/${fileId}?error=invalid_password`, 302);
      }
    }

    // Get file from storage
    const fileObject = await storageService.downloadFile(file.filename);
    
    if (!fileObject) {
      return errorResponse(ErrorCodes.FILE_NOT_FOUND, 'File not found in storage', 404);
    }

    // Increment download count
    await dbService.incrementDownloadCount(fileId);

    // Return file
    return fileResponse(
      fileObject.body,
      file.original_filename,
      file.mime_type,
      file.size
    );

  } catch (error) {
    console.error('Download error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to download file', 500);
  }
});

export { download };
