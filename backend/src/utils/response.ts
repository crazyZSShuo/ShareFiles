// Response utilities for consistent API responses

import type { ApiResponse, ApiError, ErrorCode } from '@/types/api';

/**
 * Create a successful JSON response
 */
export function successResponse<T>(data: T, status: number = 200): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create an error JSON response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number = 400,
  details?: unknown
): Response {
  const error: ApiError = {
    code,
    message,
    details,
  };
  
  const response: ApiResponse = {
    success: false,
    error: message,
  };
  
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create a CORS response
 */
export function corsResponse(origin: string): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: Response, origin: string): Response {
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set('Access-Control-Allow-Origin', origin);
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return newResponse;
}

/**
 * Create a file download response
 */
export function fileResponse(
  data: ArrayBuffer | ReadableStream,
  filename: string,
  mimeType: string,
  size?: number
): Response {
  const headers: Record<string, string> = {
    'Content-Type': mimeType,
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  
  if (size !== undefined) {
    headers['Content-Length'] = size.toString();
  }
  
  return new Response(data, {
    status: 200,
    headers,
  });
}

/**
 * Create a text content response
 */
export function textResponse(content: string, mimeType: string = 'text/plain'): Response {
  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': `${mimeType}; charset=utf-8`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
