// Main entry point for Cloudflare Workers

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from '@/types/env';
import { upload } from '@/handlers/upload';
import { download } from '@/handlers/download';
import { text } from '@/handlers/text';
import { DatabaseService } from '@/services/database';
import { StorageService } from '@/services/storage';
import { successResponse, errorResponse, corsResponse, addCorsHeaders } from '@/utils/response';
import { ErrorCodes } from '@/types/api';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());

// CORS middleware
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');
  const allowedOrigin = c.env.CORS_ORIGIN;
  
  if (c.req.method === 'OPTIONS') {
    return corsResponse(allowedOrigin);
  }
  
  await next();
  
  // Add CORS headers to response
  if (origin === allowedOrigin || allowedOrigin === '*') {
    const response = c.res;
    c.res = addCorsHeaders(response, allowedOrigin);
  }
});

// Health check endpoint
app.get('/health', (c) => {
  return successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.route('/api', upload);
app.route('/api', download);
app.route('/api/text', text);

// Admin endpoints (optional, for maintenance)
app.get('/admin/cleanup', async (c) => {
  try {
    const dbService = new DatabaseService(c.env.DB);
    
    const expiredFiles = await dbService.cleanupExpiredFiles();
    const expiredTextShares = await dbService.cleanupExpiredTextShares();
    
    return successResponse({
      cleaned_files: expiredFiles,
      cleaned_text_shares: expiredTextShares,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Cleanup failed', 500);
  }
});

app.get('/admin/stats', async (c) => {
  try {
    const dbService = new DatabaseService(c.env.DB);
    const storageService = new StorageService(c.env.BUCKET);
    
    // Get basic stats (you might want to add more specific queries)
    const storageStats = await storageService.getStorageStats();
    
    return successResponse({
      storage: storageStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to get stats', 500);
  }
});

// 404 handler
app.notFound((c) => {
  return errorResponse(ErrorCodes.FILE_NOT_FOUND, 'Endpoint not found', 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
});

// Scheduled cleanup (runs every hour)
export default {
  fetch: app.fetch,
  
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      const dbService = new DatabaseService(env.DB);
      
      // Cleanup expired records
      const expiredFiles = await dbService.cleanupExpiredFiles();
      const expiredTextShares = await dbService.cleanupExpiredTextShares();
      
      console.log(`Scheduled cleanup completed: ${expiredFiles} files, ${expiredTextShares} text shares`);
      
      // Optional: Cleanup orphaned files in storage
      // This is more expensive, so you might want to run it less frequently
      if (event.cron === '0 2 * * *') { // Daily at 2 AM
        const storageService = new StorageService(env.BUCKET);
        
        // Get all valid file IDs from database
        const validFiles = await env.DB.prepare('SELECT id FROM files WHERE is_deleted = FALSE').all();
        const validFileIds = validFiles.results.map((f: any) => f.id);
        
        const orphanedFiles = await storageService.cleanupOrphanedFiles(validFileIds);
        console.log(`Cleaned up ${orphanedFiles} orphaned files from storage`);
      }
      
    } catch (error) {
      console.error('Scheduled cleanup error:', error);
    }
  },
};
