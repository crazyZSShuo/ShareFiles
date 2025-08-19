// API types for frontend

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

export interface UploadFileRequest {
  file: File;
  expiry_hours?: number;
  max_downloads?: number;
  password?: string;
}

export interface CreateTextShareRequest {
  title?: string;
  content: string;
  language?: string;
  expiry_hours?: number;
  max_views?: number;
  password?: string;
}

export interface DownloadFileRequest {
  password?: string;
}

export interface ViewTextShareRequest {
  password?: string;
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
