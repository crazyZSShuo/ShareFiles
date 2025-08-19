// Database service for file and text share operations

import type { 
  FileRecord, 
  TextShareRecord, 
  CreateFileInput, 
  CreateTextShareInput 
} from '@/types/database';
import { generateId } from '@/utils/crypto';
import { isExpired } from '@/utils/validation';

export class DatabaseService {
  constructor(private db: D1Database) {}

  // File operations
  async createFile(input: CreateFileInput): Promise<FileRecord> {
    const id = generateId();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO files (
        id, filename, original_filename, mime_type, size, 
        upload_ip, created_at, expires_at, max_downloads, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      id,
      input.filename,
      input.original_filename,
      input.mime_type,
      input.size,
      input.upload_ip || null,
      now,
      input.expires_at,
      input.max_downloads || null,
      input.password || null
    ).run();
    
    return {
      id,
      filename: input.filename,
      original_filename: input.original_filename,
      mime_type: input.mime_type,
      size: input.size,
      upload_ip: input.upload_ip,
      created_at: now,
      expires_at: input.expires_at,
      download_count: 0,
      max_downloads: input.max_downloads,
      password_hash: input.password,
      is_deleted: false,
    };
  }

  async getFile(id: string): Promise<FileRecord | null> {
    const stmt = this.db.prepare('SELECT * FROM files WHERE id = ? AND is_deleted = FALSE');
    const result = await stmt.bind(id).first<FileRecord>();
    return result;
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const stmt = this.db.prepare('UPDATE files SET download_count = download_count + 1 WHERE id = ?');
    await stmt.bind(id).run();
  }

  async deleteFile(id: string): Promise<void> {
    const stmt = this.db.prepare('UPDATE files SET is_deleted = TRUE WHERE id = ?');
    await stmt.bind(id).run();
  }

  // Text share operations
  async createTextShare(input: CreateTextShareInput): Promise<TextShareRecord> {
    const id = generateId();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO text_shares (
        id, title, content, language, upload_ip, 
        created_at, expires_at, max_views, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      id,
      input.title || null,
      input.content,
      input.language || 'text',
      input.upload_ip || null,
      now,
      input.expires_at,
      input.max_views || null,
      input.password || null
    ).run();
    
    return {
      id,
      title: input.title,
      content: input.content,
      language: input.language || 'text',
      upload_ip: input.upload_ip,
      created_at: now,
      expires_at: input.expires_at,
      view_count: 0,
      max_views: input.max_views,
      password_hash: input.password,
      is_deleted: false,
    };
  }

  async getTextShare(id: string): Promise<TextShareRecord | null> {
    const stmt = this.db.prepare('SELECT * FROM text_shares WHERE id = ? AND is_deleted = FALSE');
    const result = await stmt.bind(id).first<TextShareRecord>();
    return result;
  }

  async incrementViewCount(id: string): Promise<void> {
    const stmt = this.db.prepare('UPDATE text_shares SET view_count = view_count + 1 WHERE id = ?');
    await stmt.bind(id).run();
  }

  async deleteTextShare(id: string): Promise<void> {
    const stmt = this.db.prepare('UPDATE text_shares SET is_deleted = TRUE WHERE id = ?');
    await stmt.bind(id).run();
  }

  // Cleanup operations
  async cleanupExpiredFiles(): Promise<number> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE files SET is_deleted = TRUE WHERE expires_at < ? AND is_deleted = FALSE');
    const result = await stmt.bind(now).run();
    return result.meta?.changes || 0;
  }

  async cleanupExpiredTextShares(): Promise<number> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE text_shares SET is_deleted = TRUE WHERE expires_at < ? AND is_deleted = FALSE');
    const result = await stmt.bind(now).run();
    return result.meta?.changes || 0;
  }

  // Validation helpers
  async isFileAccessible(file: FileRecord): Promise<{ accessible: boolean; reason?: string }> {
    if (isExpired(file.expires_at)) {
      return { accessible: false, reason: 'expired' };
    }
    
    if (file.max_downloads && file.download_count >= file.max_downloads) {
      return { accessible: false, reason: 'download_limit_reached' };
    }
    
    return { accessible: true };
  }

  async isTextShareAccessible(textShare: TextShareRecord): Promise<{ accessible: boolean; reason?: string }> {
    if (isExpired(textShare.expires_at)) {
      return { accessible: false, reason: 'expired' };
    }
    
    if (textShare.max_views && textShare.view_count >= textShare.max_views) {
      return { accessible: false, reason: 'view_limit_reached' };
    }
    
    return { accessible: true };
  }
}
