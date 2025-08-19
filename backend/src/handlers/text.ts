// Text sharing handler

import { Hono } from 'hono';
import type { Env } from '@/types/env';
import type { 
  CreateTextShareRequest, 
  ViewTextShareRequest, 
  TextShareCreateResponse, 
  TextShareInfoResponse 
} from '@/types/api';
import { createTextShareSchema, viewTextShareSchema, ErrorCodes } from '@/types/api';
import { DatabaseService } from '@/services/database';
import { hashPassword, verifyPassword } from '@/utils/crypto';
import { 
  isValidExpiryHours, 
  calculateExpiryDate, 
  getClientIP, 
  isExpired 
} from '@/utils/validation';
import { successResponse, errorResponse, textResponse } from '@/utils/response';

const text = new Hono<{ Bindings: Env }>();

// Create text share
text.post('/create', async (c) => {
  try {
    const env = c.env;
    const request = c.req.raw;
    const body = await c.req.json();
    
    // Validate request data
    const validationResult = createTextShareSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR, 
        'Invalid request parameters', 
        400, 
        validationResult.error.errors
      );
    }

    const { title, content, language, expiry_hours, max_views, password } = validationResult.data;

    // Validate expiry hours
    const maxExpiryHours = parseInt(env.MAX_EXPIRY_HOURS);
    if (!isValidExpiryHours(expiry_hours, maxExpiryHours)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR, 
        `Expiry hours must be between 1 and ${maxExpiryHours}`, 
        400
      );
    }

    // Initialize services
    const dbService = new DatabaseService(env.DB);
    
    // Prepare data
    const clientIP = getClientIP(request);
    const expiresAt = calculateExpiryDate(expiry_hours);
    const passwordHash = password ? await hashPassword(password) : undefined;

    // Create text share record
    const textShare = await dbService.createTextShare({
      title,
      content,
      language,
      upload_ip: clientIP,
      expires_at: expiresAt,
      max_views,
      password: passwordHash,
    });

    // Prepare response
    const response: TextShareCreateResponse = {
      id: textShare.id,
      title: textShare.title,
      expires_at: expiresAt,
      view_url: `${new URL(request.url).origin}/api/text/view/${textShare.id}`,
      has_password: !!password,
    };

    return successResponse(response, 201);

  } catch (error) {
    console.error('Text share creation error:', error);
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR, 
      'Failed to create text share', 
      500
    );
  }
});

// Get text share info
text.get('/info/:id', async (c) => {
  try {
    const textShareId = c.req.param('id');
    const dbService = new DatabaseService(c.env.DB);
    
    const textShare = await dbService.getTextShare(textShareId);
    
    if (!textShare) {
      return errorResponse(ErrorCodes.FILE_NOT_FOUND, 'Text share not found', 404);
    }

    const accessibility = await dbService.isTextShareAccessible(textShare);
    
    const response: TextShareInfoResponse = {
      id: textShare.id,
      title: textShare.title,
      content: textShare.content,
      language: textShare.language,
      created_at: textShare.created_at,
      expires_at: textShare.expires_at,
      view_count: textShare.view_count,
      max_views: textShare.max_views,
      has_password: !!textShare.password_hash,
      is_expired: isExpired(textShare.expires_at),
      is_view_limit_reached: !accessibility.accessible && accessibility.reason === 'view_limit_reached',
    };

    return successResponse(response);

  } catch (error) {
    console.error('Text share info error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to get text share info', 500);
  }
});

// View text share
text.post('/view/:id', async (c) => {
  try {
    const textShareId = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    
    // Validate request
    const validationResult = viewTextShareSchema.safeParse(body);
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
    
    // Get text share record
    const textShare = await dbService.getTextShare(textShareId);
    
    if (!textShare) {
      return errorResponse(ErrorCodes.FILE_NOT_FOUND, 'Text share not found', 404);
    }

    // Check accessibility
    const accessibility = await dbService.isTextShareAccessible(textShare);
    
    if (!accessibility.accessible) {
      if (accessibility.reason === 'expired') {
        return errorResponse(ErrorCodes.FILE_EXPIRED, 'Text share has expired', 410);
      } else if (accessibility.reason === 'view_limit_reached') {
        return errorResponse(ErrorCodes.VIEW_LIMIT_REACHED, 'View limit reached', 403);
      }
    }

    // Check password if required
    if (textShare.password_hash) {
      if (!password) {
        return errorResponse(ErrorCodes.INVALID_PASSWORD, 'Password required', 401);
      }
      
      const isValidPassword = await verifyPassword(password, textShare.password_hash);
      if (!isValidPassword) {
        return errorResponse(ErrorCodes.INVALID_PASSWORD, 'Invalid password', 401);
      }
    }

    // Increment view count
    await dbService.incrementViewCount(textShareId);

    // Return text share info
    const response: TextShareInfoResponse = {
      id: textShare.id,
      title: textShare.title,
      content: textShare.content,
      language: textShare.language,
      created_at: textShare.created_at,
      expires_at: textShare.expires_at,
      view_count: textShare.view_count + 1, // Include the current view
      max_views: textShare.max_views,
      has_password: !!textShare.password_hash,
      is_expired: false, // We already checked it's not expired
      is_view_limit_reached: textShare.max_views ? (textShare.view_count + 1) >= textShare.max_views : false,
    };

    return successResponse(response);

  } catch (error) {
    console.error('Text share view error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to view text share', 500);
  }
});

// Direct view (GET request for simple links)
text.get('/view/:id', async (c) => {
  try {
    const textShareId = c.req.param('id');
    const password = c.req.query('password');
    
    // Initialize services
    const dbService = new DatabaseService(c.env.DB);
    
    // Get text share record
    const textShare = await dbService.getTextShare(textShareId);
    
    if (!textShare) {
      return errorResponse(ErrorCodes.FILE_NOT_FOUND, 'Text share not found', 404);
    }

    // Check accessibility
    const accessibility = await dbService.isTextShareAccessible(textShare);

    if (!accessibility.accessible) {
      const frontendUrl = c.env.CORS_ORIGIN === '*' ? 'http://localhost:3001' : c.env.CORS_ORIGIN;

      if (accessibility.reason === 'expired') {
        return c.redirect(`${frontendUrl}/text/${textShareId}?error=expired`, 302);
      } else if (accessibility.reason === 'view_limit_reached') {
        return c.redirect(`${frontendUrl}/text/${textShareId}?error=view_limit_reached`, 302);
      }
    }

    // Check password if required
    if (textShare.password_hash) {
      if (!password) {
        // Redirect to text view page instead of returning JSON error
        const frontendUrl = c.env.CORS_ORIGIN === '*' ? 'http://localhost:3001' : c.env.CORS_ORIGIN;
        return c.redirect(`${frontendUrl}/text/${textShareId}`, 302);
      }

      const isValidPassword = await verifyPassword(password, textShare.password_hash);
      if (!isValidPassword) {
        // Redirect to text view page with error parameter
        const frontendUrl = c.env.CORS_ORIGIN === '*' ? 'http://localhost:3001' : c.env.CORS_ORIGIN;
        return c.redirect(`${frontendUrl}/text/${textShareId}?error=invalid_password`, 302);
      }
    }

    // Increment view count
    await dbService.incrementViewCount(textShareId);

    // Return raw text content
    return textResponse(textShare.content, 'text/plain');

  } catch (error) {
    console.error('Text share view error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to view text share', 500);
  }
});

export { text };
