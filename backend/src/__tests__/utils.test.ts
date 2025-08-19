// Unit tests for utility functions

import { describe, it, expect } from 'vitest';
import { 
  generateId, 
  generateSecureFilename, 
  sanitizeFilename, 
  hashPassword, 
  verifyPassword 
} from '../utils/crypto';
import { 
  isAllowedFileType, 
  getExtensionFromMimeType, 
  isValidFileSize, 
  isValidExpiryHours, 
  calculateExpiryDate, 
  isExpired 
} from '../utils/validation';

describe('Crypto Utils', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).toHaveLength(12);
    expect(id2).toHaveLength(12);
    expect(id1).not.toBe(id2);
  });

  it('should generate secure filenames', () => {
    const filename = generateSecureFilename('test.txt');
    expect(filename).toMatch(/^[A-Za-z0-9]{16}\.txt$/);
    
    const filenameNoExt = generateSecureFilename('test');
    expect(filenameNoExt).toMatch(/^[A-Za-z0-9]{16}$/);
  });

  it('should sanitize filenames', () => {
    expect(sanitizeFilename('test<>file.txt')).toBe('test__file.txt');
    expect(sanitizeFilename('test file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('normal-file.txt')).toBe('normal-file.txt');
  });

  it('should hash and verify passwords', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    
    expect(hash).toHaveLength(64); // SHA-256 hex string
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('wrongpassword', hash)).toBe(false);
  });
});

describe('Validation Utils', () => {
  it('should validate allowed file types', () => {
    expect(isAllowedFileType('image/jpeg')).toBe(true);
    expect(isAllowedFileType('application/pdf')).toBe(true);
    expect(isAllowedFileType('text/plain')).toBe(true);
    expect(isAllowedFileType('application/x-executable')).toBe(false);
  });

  it('should get correct file extensions', () => {
    expect(getExtensionFromMimeType('image/jpeg')).toBe('jpg');
    expect(getExtensionFromMimeType('application/pdf')).toBe('pdf');
    expect(getExtensionFromMimeType('text/plain')).toBe('txt');
    expect(getExtensionFromMimeType('unknown/type')).toBe('bin');
  });

  it('should validate file sizes', () => {
    expect(isValidFileSize(1000, 10000)).toBe(true);
    expect(isValidFileSize(15000, 10000)).toBe(false);
    expect(isValidFileSize(0, 10000)).toBe(false);
    expect(isValidFileSize(-100, 10000)).toBe(false);
  });

  it('should validate expiry hours', () => {
    expect(isValidExpiryHours(24, 168)).toBe(true);
    expect(isValidExpiryHours(1, 168)).toBe(true);
    expect(isValidExpiryHours(168, 168)).toBe(true);
    expect(isValidExpiryHours(0, 168)).toBe(false);
    expect(isValidExpiryHours(200, 168)).toBe(false);
  });

  it('should calculate expiry dates correctly', () => {
    const now = new Date();
    const expiry = new Date(calculateExpiryDate(24));
    const expectedExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Allow for small time differences (within 1 second)
    expect(Math.abs(expiry.getTime() - expectedExpiry.getTime())).toBeLessThan(1000);
  });

  it('should check expiry correctly', () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    const futureDate = new Date(Date.now() + 1000).toISOString();
    
    expect(isExpired(pastDate)).toBe(true);
    expect(isExpired(futureDate)).toBe(false);
  });
});

describe('Edge Cases', () => {
  it('should handle empty strings', () => {
    expect(sanitizeFilename('')).toBe('');
    expect(generateSecureFilename('')).toMatch(/^[A-Za-z0-9]{16}$/);
  });

  it('should handle very long filenames', () => {
    const longFilename = 'a'.repeat(300) + '.txt';
    const sanitized = sanitizeFilename(longFilename);
    expect(sanitized.length).toBeLessThanOrEqual(255);
  });

  it('should handle special characters in passwords', async () => {
    const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const hash = await hashPassword(specialPassword);
    expect(await verifyPassword(specialPassword, hash)).toBe(true);
  });
});
