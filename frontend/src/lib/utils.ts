// Utility functions

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

export function formatTimeUntilExpiry(expiryDateString: string): string {
  const expiry = new Date(expiryDateString);
  const now = new Date();
  const diffInSeconds = Math.floor((expiry.getTime() - now.getTime()) / 1000);

  if (diffInSeconds <= 0) {
    return 'Expired';
  } else if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds > 1 ? 's' : ''} left`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} left`;
  }
}

export function isExpired(expiryDateString: string): boolean {
  return new Date() > new Date(expiryDateString);
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('text/')) return '📝';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
  if (mimeType.includes('json') || mimeType.includes('javascript')) return '⚙️';
  return '📁';
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve();
      } else {
        reject(new Error('Copy failed'));
      }
      document.body.removeChild(textArea);
    });
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 1) {
    return { valid: false, message: 'Password cannot be empty' };
  }
  if (password.length > 100) {
    return { valid: false, message: 'Password is too long' };
  }
  return { valid: true };
}

export function validateExpiryHours(hours: number): { valid: boolean; message?: string } {
  if (hours < 1) {
    return { valid: false, message: 'Expiry must be at least 1 hour' };
  }
  if (hours > 168) {
    return { valid: false, message: 'Expiry cannot exceed 7 days (168 hours)' };
  }
  return { valid: true };
}
