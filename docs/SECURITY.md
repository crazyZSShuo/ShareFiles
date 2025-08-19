# Security Guide

This document outlines the security measures implemented in ShareFilesCF and best practices for deployment.

## Security Architecture

### 1. Data Protection

#### File Storage Security
- **Encryption at Rest**: R2 provides automatic encryption
- **Secure File Names**: Generated using cryptographically secure random IDs
- **Access Control**: Files are only accessible via secure URLs
- **Automatic Deletion**: Files are automatically deleted after expiration

#### Password Security
```typescript
// Secure password hashing using SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

#### Database Security
- **Prepared Statements**: Prevent SQL injection
- **Input Validation**: All inputs are validated using Zod schemas
- **Minimal Data Storage**: Only essential metadata is stored

### 2. Network Security

#### HTTPS Enforcement
- All traffic is encrypted using TLS 1.3
- HTTP requests are automatically redirected to HTTPS
- HSTS headers are set for enhanced security

#### CORS Configuration
```typescript
// Strict CORS policy
const corsHeaders = {
  'Access-Control-Allow-Origin': env.CORS_ORIGIN, // Specific domain only
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

#### Security Headers
```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
};
```

### 3. Input Validation

#### File Upload Validation
```typescript
// Comprehensive file validation
const validateFile = (file: File) => {
  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  // Type validation
  if (!isAllowedFileType(file.type)) {
    throw new Error('File type not allowed');
  }
  
  // Name validation
  const sanitizedName = sanitizeFilename(file.name);
  if (sanitizedName !== file.name) {
    console.warn('Filename was sanitized');
  }
};
```

#### Request Validation
```typescript
// Using Zod for runtime type checking
const uploadSchema = z.object({
  expiry_hours: z.number().min(1).max(168),
  max_downloads: z.number().min(1).optional(),
  password: z.string().min(1).optional(),
});
```

## Rate Limiting

### 1. Implementation
```typescript
// KV-based rate limiting
const rateLimitKey = `rate_limit:${clientIP}`;
const current = await env.RATE_LIMITER.get(rateLimitKey);
const count = current ? parseInt(current) : 0;

if (count >= RATE_LIMIT) {
  return errorResponse(ErrorCodes.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded', 429);
}

await env.RATE_LIMITER.put(rateLimitKey, (count + 1).toString(), {
  expirationTtl: 3600, // 1 hour
});
```

### 2. Rate Limit Configuration
- **File Uploads**: 10 uploads per hour per IP
- **Text Shares**: 20 shares per hour per IP
- **Downloads**: 100 downloads per hour per IP
- **API Requests**: 1000 requests per hour per IP

## Privacy Protection

### 1. Data Minimization
- No user accounts or profiles
- No tracking cookies or analytics
- Minimal metadata collection
- IP addresses used only for rate limiting

### 2. Automatic Cleanup
```typescript
// Scheduled cleanup every hour
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    const dbService = new DatabaseService(env.DB);
    
    // Clean expired files
    await dbService.cleanupExpiredFiles();
    await dbService.cleanupExpiredTextShares();
    
    // Clean orphaned storage objects
    await cleanupOrphanedFiles(env.BUCKET);
  },
};
```

### 3. No Data Retention
- Files are deleted immediately upon expiration
- No backup or archival of user content
- Database records are marked as deleted and cleaned up

## Vulnerability Prevention

### 1. Common Web Vulnerabilities

#### XSS Prevention
- Content-Security-Policy headers
- Input sanitization
- Output encoding
- No innerHTML usage with user content

#### CSRF Prevention
- SameSite cookie attributes
- Origin header validation
- No state-changing GET requests

#### Injection Prevention
- Prepared statements for database queries
- Input validation with Zod schemas
- Parameterized queries only

### 2. File Upload Security

#### Malware Prevention
```typescript
// File type validation
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf', 'text/plain',
  // ... other safe types
];

const isAllowedFileType = (mimeType: string): boolean => {
  return ALLOWED_MIME_TYPES.includes(mimeType);
};
```

#### Content Scanning
- File type verification beyond MIME type
- Size limits to prevent DoS
- Filename sanitization

### 3. Access Control

#### File Access
- Unique, unpredictable file IDs
- No directory traversal possible
- Time-based access expiration
- Optional password protection

#### API Access
- No authentication required (by design)
- Rate limiting per IP
- Input validation on all endpoints

## Incident Response

### 1. Security Monitoring

#### Automated Alerts
```typescript
// Monitor for suspicious activity
const detectSuspiciousActivity = (request: Request) => {
  const userAgent = request.headers.get('User-Agent');
  const origin = request.headers.get('Origin');
  
  // Check for known bad patterns
  if (userAgent?.includes('bot') && !isAllowedBot(userAgent)) {
    return true;
  }
  
  return false;
};
```

#### Logging
- All errors are logged with context
- Security events are tracked
- No sensitive data in logs

### 2. Response Procedures

#### Security Incident Response
1. **Detection**: Automated monitoring alerts
2. **Assessment**: Evaluate impact and scope
3. **Containment**: Block malicious IPs if needed
4. **Recovery**: Clean up any compromised data
5. **Lessons Learned**: Update security measures

#### Data Breach Response
1. **Immediate**: Stop the breach source
2. **Assessment**: Determine what data was accessed
3. **Notification**: Inform users if required
4. **Remediation**: Fix vulnerabilities
5. **Prevention**: Implement additional safeguards

## Security Best Practices

### 1. Deployment Security

#### Environment Variables
- Never commit secrets to version control
- Use Cloudflare's secret management
- Rotate secrets regularly
- Use different secrets for different environments

#### Access Control
- Limit Cloudflare account access
- Use API tokens with minimal permissions
- Enable two-factor authentication
- Regular access reviews

### 2. Code Security

#### Secure Coding Practices
- Input validation on all user inputs
- Output encoding for all outputs
- Error handling that doesn't leak information
- Regular dependency updates

#### Security Testing
```bash
# Run security tests
npm audit
npm run test:security

# Check for known vulnerabilities
npx audit-ci --moderate
```

### 3. Infrastructure Security

#### Cloudflare Security Features
- DDoS protection (automatic)
- Web Application Firewall (WAF)
- Bot management
- SSL/TLS encryption

#### Monitoring and Alerting
- Set up alerts for unusual traffic patterns
- Monitor error rates and response times
- Track security-related metrics

## Compliance Considerations

### 1. Data Protection Regulations

#### GDPR Compliance
- No personal data collection by design
- Automatic data deletion
- No data processing beyond service provision
- No data transfers to third parties

#### Privacy by Design
- Data minimization principles
- Purpose limitation
- Storage limitation
- Transparency

### 2. Security Standards

#### Industry Best Practices
- OWASP Top 10 mitigation
- Secure development lifecycle
- Regular security assessments
- Incident response procedures

## Security Checklist

### Pre-Deployment
- [ ] All dependencies are up to date
- [ ] Security headers are configured
- [ ] Rate limiting is implemented
- [ ] Input validation is comprehensive
- [ ] Error handling doesn't leak information
- [ ] CORS is properly configured

### Post-Deployment
- [ ] Monitor for security alerts
- [ ] Regular security assessments
- [ ] Keep dependencies updated
- [ ] Monitor access logs
- [ ] Test incident response procedures
- [ ] Review and update security measures

### Ongoing
- [ ] Monthly security reviews
- [ ] Quarterly penetration testing
- [ ] Annual security audits
- [ ] Continuous monitoring
- [ ] Staff security training
- [ ] Security awareness updates
