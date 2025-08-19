# Performance Optimization Guide

This document outlines performance optimizations implemented in ShareFilesCF and additional recommendations.

## Backend Optimizations

### 1. Database Optimizations

#### Indexes
- **Files table**: Indexed on `expires_at`, `created_at`, and `is_deleted`
- **Text shares table**: Indexed on `expires_at`, `created_at`, and `is_deleted`

#### Query Optimization
```sql
-- Efficient cleanup query
UPDATE files SET is_deleted = TRUE 
WHERE expires_at < ? AND is_deleted = FALSE;

-- Efficient file lookup
SELECT * FROM files 
WHERE id = ? AND is_deleted = FALSE;
```

#### Connection Pooling
- D1 automatically handles connection pooling
- Use prepared statements for better performance

### 2. Storage Optimizations

#### R2 Storage
- **Multipart uploads**: For files > 5MB (future enhancement)
- **Compression**: Automatic compression for text files
- **CDN**: Global edge caching through Cloudflare

#### Caching Strategy
```typescript
// Cache file metadata for 5 minutes
const cacheKey = `file:${fileId}`;
const cached = await env.CACHE.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
```

### 3. Worker Optimizations

#### Cold Start Reduction
- Minimal dependencies
- Tree-shaking enabled
- Bundle size < 1MB

#### Memory Usage
- Stream large files instead of loading into memory
- Use ReadableStream for file downloads
- Cleanup resources after use

## Frontend Optimizations

### 1. Bundle Optimization

#### Code Splitting
```typescript
// Dynamic imports for heavy components
const FileUpload = lazy(() => import('./components/FileUpload'));
const TextShare = lazy(() => import('./components/TextShare'));
```

#### Tree Shaking
- ES modules for better tree shaking
- Minimal external dependencies
- Custom utility functions instead of heavy libraries

### 2. Image and Asset Optimization

#### Next.js Optimizations
```javascript
// next.config.js
module.exports = {
  images: {
    unoptimized: true, // For static export
  },
  experimental: {
    optimizeCss: true,
  },
};
```

#### Tailwind CSS Purging
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Automatically purges unused styles
};
```

### 3. Runtime Optimizations

#### React Optimizations
```typescript
// Memoize expensive calculations
const fileIcon = useMemo(() => getFileIcon(mimeType), [mimeType]);

// Debounce user input
const debouncedSearch = useDebounce(searchTerm, 300);
```

#### Loading States
- Skeleton loaders for better perceived performance
- Progressive loading for large file lists
- Optimistic updates for better UX

## Network Optimizations

### 1. HTTP/2 and HTTP/3
- Cloudflare automatically enables HTTP/2 and HTTP/3
- Multiplexing reduces connection overhead

### 2. Compression
```typescript
// Enable compression for text responses
const response = new Response(content, {
  headers: {
    'Content-Type': 'text/plain',
    'Content-Encoding': 'gzip',
  },
});
```

### 3. Caching Headers
```typescript
// Cache static assets
const headers = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'ETag': generateETag(content),
};

// Cache API responses briefly
const apiHeaders = {
  'Cache-Control': 'public, max-age=300', // 5 minutes
};
```

## Monitoring and Metrics

### 1. Core Web Vitals

#### Largest Contentful Paint (LCP)
- Target: < 2.5 seconds
- Optimizations: Image optimization, critical CSS

#### First Input Delay (FID)
- Target: < 100 milliseconds
- Optimizations: Code splitting, minimal JavaScript

#### Cumulative Layout Shift (CLS)
- Target: < 0.1
- Optimizations: Fixed dimensions, font loading

### 2. Custom Metrics

#### Backend Metrics
```typescript
// Track response times
const startTime = Date.now();
// ... process request
const duration = Date.now() - startTime;
console.log(`Request processed in ${duration}ms`);
```

#### Frontend Metrics
```typescript
// Track user interactions
const trackUpload = (fileSize: number, duration: number) => {
  // Send to analytics (if implemented)
  console.log(`Upload: ${fileSize} bytes in ${duration}ms`);
};
```

## Performance Testing

### 1. Load Testing

#### Backend Load Testing
```bash
# Using wrk for load testing
wrk -t12 -c400 -d30s --script=upload-test.lua https://your-worker.workers.dev

# Test file upload endpoint
wrk -t4 -c100 -d10s -s upload.lua https://your-worker.workers.dev/api/upload
```

#### Frontend Performance Testing
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage

# WebPageTest
curl -X POST "https://www.webpagetest.org/runtest.php" \
  -d "url=https://your-site.pages.dev" \
  -d "k=YOUR_API_KEY"
```

### 2. Synthetic Monitoring

#### Uptime Monitoring
```typescript
// Cloudflare Worker for health checks
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    const response = await fetch('https://your-api.workers.dev/health');
    if (!response.ok) {
      // Send alert
      await sendAlert('API health check failed');
    }
  },
};
```

## Optimization Checklist

### Backend
- [ ] Database indexes are properly configured
- [ ] Prepared statements are used for queries
- [ ] File streaming is implemented for large files
- [ ] Cleanup jobs are scheduled and running
- [ ] Error handling doesn't leak sensitive information
- [ ] Rate limiting is implemented

### Frontend
- [ ] Bundle size is optimized (< 500KB gzipped)
- [ ] Images are optimized and properly sized
- [ ] Critical CSS is inlined
- [ ] JavaScript is code-split and lazy-loaded
- [ ] Loading states provide good UX
- [ ] Error boundaries handle failures gracefully

### Infrastructure
- [ ] CDN is properly configured
- [ ] Compression is enabled
- [ ] Caching headers are set appropriately
- [ ] HTTP/2 is enabled
- [ ] SSL/TLS is properly configured
- [ ] Security headers are set

## Future Optimizations

### 1. Advanced Caching
- Implement Redis-like caching with KV
- Cache frequently accessed files
- Implement cache invalidation strategies

### 2. Advanced Upload Features
- Resumable uploads for large files
- Client-side compression before upload
- Parallel chunk uploads

### 3. Performance Monitoring
- Real User Monitoring (RUM)
- Synthetic monitoring with alerts
- Performance budgets and CI integration

### 4. Edge Computing
- Move more logic to the edge
- Implement edge-side includes (ESI)
- Use Cloudflare Workers for image optimization

## Troubleshooting Performance Issues

### Common Issues

1. **Slow file uploads**
   - Check file size limits
   - Verify network connectivity
   - Monitor R2 performance

2. **High database latency**
   - Check query performance
   - Verify index usage
   - Monitor D1 metrics

3. **Frontend loading slowly**
   - Analyze bundle size
   - Check for render-blocking resources
   - Verify CDN configuration

### Debugging Tools

- **Cloudflare Analytics**: Monitor traffic and performance
- **Browser DevTools**: Analyze frontend performance
- **Wrangler Tail**: Monitor Worker logs in real-time
- **Lighthouse**: Audit web performance
