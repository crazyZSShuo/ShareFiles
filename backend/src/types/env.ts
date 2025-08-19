// Environment types for Cloudflare Workers

export interface Env {
  // D1 Database binding
  DB: D1Database;
  
  // R2 Storage binding
  BUCKET: R2Bucket;
  
  // KV for rate limiting (optional)
  RATE_LIMITER?: KVNamespace;
  
  // Environment variables
  CORS_ORIGIN: string;
  MAX_FILE_SIZE: string;
  DEFAULT_EXPIRY_HOURS: string;
  MAX_EXPIRY_HOURS: string;
}

// Request context type
export interface RequestContext {
  env: Env;
  ctx: ExecutionContext;
  request: Request;
}
