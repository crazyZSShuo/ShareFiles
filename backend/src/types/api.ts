// API request and response types

import { z } from 'zod';

// Upload file request schema
export const uploadFileSchema = z.object({
  expiry_hours: z.number().min(1).max(168).default(24),
  max_downloads: z.number().min(1).optional(),
  password: z.string().min(1).optional(),
});

export type UploadFileRequest = z.infer<typeof uploadFileSchema>;

// Create text share request schema
export const createTextShareSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(1000000), // 1MB text limit
  language: z.string().max(50).optional().default('text'),
  expiry_hours: z.number().min(1).max(168).optional().default(24),
  max_views: z.number().min(1).optional(),
  password: z.string().min(1).optional(),
});

export type CreateTextShareRequest = z.infer<typeof createTextShareSchema>;

// Download file request schema
export const downloadFileSchema = z.object({
  password: z.string().optional(),
});

export type DownloadFileRequest = z.infer<typeof downloadFileSchema>;

// View text share request schema
export const viewTextShareSchema = z.object({
  password: z.string().optional(),
});

export type ViewTextShareRequest = z.infer<typeof viewTextShareSchema>;

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  size: number;
  expires_at: string;
  download_url: string;
  has_password: boolean;
}

export interface TextShareCreateResponse {
  id: string;
  title?: string;
  expires_at: string;
  view_url: string;
  has_password: boolean;
}

export interface FileInfoResponse {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  created_at: string;
  expires_at: string;
  download_count: number;
  max_downloads?: number;
  has_password: boolean;
  is_expired: boolean;
  is_download_limit_reached: boolean;
}

export interface TextShareInfoResponse {
  id: string;
  title?: string;
  content: string;
  language: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  max_views?: number;
  has_password: boolean;
  is_expired: boolean;
  is_view_limit_reached: boolean;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_EXPIRED: 'FILE_EXPIRED',
  DOWNLOAD_LIMIT_REACHED: 'DOWNLOAD_LIMIT_REACHED',
  VIEW_LIMIT_REACHED: 'VIEW_LIMIT_REACHED',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
