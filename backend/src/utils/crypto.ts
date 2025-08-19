// Cryptographic utilities for password hashing and file encryption

/**
 * Hash a password using SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate a secure random ID
 */
export function generateId(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
}

/**
 * Generate a secure filename
 */
export function generateSecureFilename(originalFilename: string): string {
  const extension = originalFilename.split('.').pop() || '';
  const id = generateId(16);
  return extension ? `${id}.${extension}` : id;
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255); // Limit length
}
