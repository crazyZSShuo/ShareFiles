// File upload handler

import { Hono } from 'hono';
import type { Env } from '@/types/env';
import type { UploadFileRequest, UploadResponse } from '@/types/api';
import { uploadFileSchema, ErrorCodes } from '@/types/api';
import { DatabaseService } from '@/services/database';
import { StorageService } from '@/services/storage';
import { 
  generateSecureFilename, 
  sanitizeFilename, 
  hashPassword 
} from '@/utils/crypto';
import { 
  isAllowedFileType, 
  isValidFileSize, 
  isValidExpiryHours, 
  calculateExpiryDate, 
  getClientIP 
} from '@/utils/validation';
import { successResponse, errorResponse } from '@/utils/response';

const upload = new Hono<{ Bindings: Env }>();

upload.post('/upload', async (c) => {
  try {
    const env = c.env;
    const request = c.req.raw;
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No file provided', 400);
    }

    // Parse additional parameters
    const expiryHours = Number(formData.get('expiry_hours')) || 24;
    const maxDownloadsStr = formData.get('max_downloads') as string;
    const maxDownloads = maxDownloadsStr && maxDownloadsStr.trim() !== '' ? Number(maxDownloadsStr) : undefined;
    const passwordStr = formData.get('password') as string;
    const password = passwordStr && passwordStr.trim() !== '' ? passwordStr : undefined;

    // Validate request data
    const requestData = {
      expiry_hours: expiryHours,
      max_downloads: maxDownloads,
      password,
    };

    console.log('Upload request data:', requestData);

    const validationResult = uploadFileSchema.safeParse(requestData);

    if (!validationResult.success) {
      console.log('Validation errors:', validationResult.error.errors);
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Invalid request parameters: ${validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        400,
        validationResult.error.errors
      );
    }

    // Validate file
    const maxFileSize = parseInt(env.MAX_FILE_SIZE);
    const maxExpiryHours = parseInt(env.MAX_EXPIRY_HOURS);

    if (!isValidFileSize(file.size, maxFileSize)) {
      return errorResponse(
        ErrorCodes.FILE_TOO_LARGE, 
        `File size exceeds maximum allowed size of ${maxFileSize} bytes`, 
        400
      );
    }

    if (!isAllowedFileType(file.type)) {
      return errorResponse(
        ErrorCodes.UNSUPPORTED_FILE_TYPE, 
        `File type ${file.type} is not supported`, 
        400
      );
    }

    if (!isValidExpiryHours(expiryHours, maxExpiryHours)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR, 
        `Expiry hours must be between 1 and ${maxExpiryHours}`, 
        400
      );
    }

    // Initialize services
    const dbService = new DatabaseService(env.DB);
    const storageService = new StorageService(env.BUCKET);

    // Generate secure filename and prepare file data
    const originalFilename = sanitizeFilename(file.name);
    const secureFilename = generateSecureFilename(originalFilename);
    const fileBuffer = await file.arrayBuffer();
    const clientIP = getClientIP(request);
    const expiresAt = calculateExpiryDate(expiryHours);
    
    // Hash password if provided
    const passwordHash = password ? await hashPassword(password) : undefined;

    // Create database record
    const fileRecord = await dbService.createFile({
      filename: secureFilename,
      original_filename: originalFilename,
      mime_type: file.type,
      size: file.size,
      upload_ip: clientIP,
      expires_at: expiresAt,
      max_downloads: maxDownloads,
      password: passwordHash,
    });

    // Upload file to R2 storage
    await storageService.uploadFile(secureFilename, fileBuffer, {
      'original-filename': originalFilename,
      'mime-type': file.type,
      'upload-ip': clientIP,
      'file-id': fileRecord.id,
    });

    // Prepare response
    const response: UploadResponse = {
      id: fileRecord.id,
      filename: originalFilename,
      size: file.size,
      expires_at: expiresAt,
      download_url: `${new URL(request.url).origin}/api/download/${fileRecord.id}`,
      has_password: !!password,
    };

    return successResponse(response, 201);

  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR, 
      'Failed to upload file', 
      500
    );
  }
});

export { upload };
