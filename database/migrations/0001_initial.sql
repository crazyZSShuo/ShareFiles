-- Initial migration for ShareFilesCF
-- Creates tables for file metadata and text shares

-- Files table for storing file metadata
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    upload_ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT NULL,
    password_hash TEXT DEFAULT NULL,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Text shares table for storing text content
CREATE TABLE IF NOT EXISTS text_shares (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT NOT NULL,
    language TEXT DEFAULT 'text',
    upload_ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    view_count INTEGER DEFAULT 0,
    max_views INTEGER DEFAULT NULL,
    password_hash TEXT DEFAULT NULL,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_expires_at ON files(expires_at);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_files_is_deleted ON files(is_deleted);

CREATE INDEX IF NOT EXISTS idx_text_shares_expires_at ON text_shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_text_shares_created_at ON text_shares(created_at);
CREATE INDEX IF NOT EXISTS idx_text_shares_is_deleted ON text_shares(is_deleted);
