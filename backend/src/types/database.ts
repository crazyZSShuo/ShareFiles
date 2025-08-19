// Database schema types for ShareFilesCF

export interface FileRecord {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  upload_ip?: string;
  created_at: string;
  expires_at: string;
  download_count: number;
  max_downloads?: number;
  password_hash?: string;
  is_deleted: boolean;
}

export interface TextShareRecord {
  id: string;
  title?: string;
  content: string;
  language: string;
  upload_ip?: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  max_views?: number;
  password_hash?: string;
  is_deleted: boolean;
}

// Input types for creating new records
export interface CreateFileInput {
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  upload_ip?: string;
  expires_at: string;
  max_downloads?: number;
  password?: string;
}

export interface CreateTextShareInput {
  title?: string;
  content: string;
  language?: string;
  upload_ip?: string;
  expires_at: string;
  max_views?: number;
  password?: string;
}

// Response types for API
export interface FileResponse {
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
}

export interface TextShareResponse {
  id: string;
  title?: string;
  content: string;
  language: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  max_views?: number;
  has_password: boolean;
}

// Database interface
export interface Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

// Cloudflare D1 types
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    size_after: number;
    rows_read: number;
    rows_written: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}
