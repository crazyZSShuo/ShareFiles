// Unit tests for frontend utility functions

import { describe, it, expect } from 'vitest';
import { 
  formatFileSize, 
  formatDate, 
  formatRelativeTime, 
  formatTimeUntilExpiry, 
  isExpired, 
  getFileIcon, 
  validatePassword, 
  validateExpiryHours 
} from '../lib/utils';

describe('Format Utils', () => {
  it('should format file sizes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1073741824)).toBe('1 GB');
    expect(formatFileSize(1500)).toBe('1.46 KB');
  });

  it('should format dates correctly', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const formatted = formatDate(date.toISOString());
    expect(formatted).toContain('2024');
    expect(formatted).toContain('1/1/2024'); // US format
  });

  it('should format relative time correctly', () => {
    const now = new Date();
    
    // Just now
    const justNow = new Date(now.getTime() - 30 * 1000).toISOString();
    expect(formatRelativeTime(justNow)).toBe('just now');
    
    // Minutes ago
    const minutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(minutesAgo)).toBe('5 minutes ago');
    
    // Hours ago
    const hoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(hoursAgo)).toBe('2 hours ago');
    
    // Days ago
    const daysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(daysAgo)).toBe('3 days ago');
  });

  it('should format time until expiry correctly', () => {
    const now = new Date();
    
    // Expired
    const expired = new Date(now.getTime() - 1000).toISOString();
    expect(formatTimeUntilExpiry(expired)).toBe('Expired');
    
    // Seconds left
    const secondsLeft = new Date(now.getTime() + 30 * 1000).toISOString();
    expect(formatTimeUntilExpiry(secondsLeft)).toBe('30 seconds left');
    
    // Minutes left
    const minutesLeft = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
    expect(formatTimeUntilExpiry(minutesLeft)).toBe('5 minutes left');
    
    // Hours left
    const hoursLeft = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
    expect(formatTimeUntilExpiry(hoursLeft)).toBe('2 hours left');
    
    // Days left
    const daysLeft = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatTimeUntilExpiry(daysLeft)).toBe('3 days left');
  });

  it('should check expiry correctly', () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 1000).toISOString();
    const futureDate = new Date(now.getTime() + 1000).toISOString();
    
    expect(isExpired(pastDate)).toBe(true);
    expect(isExpired(futureDate)).toBe(false);
  });

  it('should get correct file icons', () => {
    expect(getFileIcon('image/jpeg')).toBe('🖼️');
    expect(getFileIcon('video/mp4')).toBe('🎥');
    expect(getFileIcon('audio/mp3')).toBe('🎵');
    expect(getFileIcon('application/pdf')).toBe('📄');
    expect(getFileIcon('text/plain')).toBe('📝');
    expect(getFileIcon('application/zip')).toBe('📦');
    expect(getFileIcon('application/json')).toBe('⚙️');
    expect(getFileIcon('unknown/type')).toBe('📁');
  });
});

describe('Validation Utils', () => {
  it('should validate passwords correctly', () => {
    expect(validatePassword('').valid).toBe(false);
    expect(validatePassword('validpassword').valid).toBe(true);
    expect(validatePassword('a'.repeat(101)).valid).toBe(false);
    expect(validatePassword('short').valid).toBe(true);
  });

  it('should validate expiry hours correctly', () => {
    expect(validateExpiryHours(0).valid).toBe(false);
    expect(validateExpiryHours(1).valid).toBe(true);
    expect(validateExpiryHours(24).valid).toBe(true);
    expect(validateExpiryHours(168).valid).toBe(true);
    expect(validateExpiryHours(169).valid).toBe(false);
    expect(validateExpiryHours(-1).valid).toBe(false);
  });
});

describe('Edge Cases', () => {
  it('should handle very large file sizes', () => {
    const terabyte = 1024 * 1024 * 1024 * 1024;
    expect(formatFileSize(terabyte)).toBe('1 TB');
  });

  it('should handle singular vs plural time units', () => {
    const now = new Date();
    
    // Singular
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
    
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
  });

  it('should handle edge case mime types', () => {
    expect(getFileIcon('')).toBe('📁');
    expect(getFileIcon('image/')).toBe('🖼️');
    expect(getFileIcon('video/')).toBe('🎥');
  });
});
