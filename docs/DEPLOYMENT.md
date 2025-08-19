# ShareFilesCF Deployment Guide

This guide will help you deploy ShareFilesCF to Cloudflare Workers and Pages.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Node.js**: Version 18 or higher
3. **Git**: For version control
4. **Wrangler CLI**: Cloudflare's command-line tool

## Installation

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/yourusername/sharefilescf.git
   cd sharefilescf
   npm install
   ```

## Backend Deployment (Cloudflare Workers)

### 1. Create D1 Database

```bash
cd backend
wrangler d1 create sharefiles-db
```

Copy the database ID from the output and update `backend/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "sharefiles-db"
database_id = "your-database-id-here"
```

### 2. Run Database Migrations

```bash
wrangler d1 migrations apply sharefiles-db
```

### 3. Create R2 Bucket

```bash
wrangler r2 bucket create sharefiles-storage
```

### 4. Create KV Namespace (Optional, for rate limiting)

```bash
wrangler kv:namespace create "RATE_LIMITER"
```

Update the KV namespace ID in `wrangler.toml`.

### 5. Configure Environment Variables

Update `backend/wrangler.toml` with your settings:

```toml
[vars]
CORS_ORIGIN = "https://your-frontend-domain.pages.dev"
MAX_FILE_SIZE = "10485760"  # 10MB
DEFAULT_EXPIRY_HOURS = "24"
MAX_EXPIRY_HOURS = "168"    # 7 days
```

### 6. Deploy Backend

```bash
npm run deploy
```

Your backend will be available at: `https://sharefilescf-backend.your-subdomain.workers.dev`

## Frontend Deployment (Cloudflare Pages)

### 1. Update API URL

Update `frontend/next.config.js`:

```javascript
env: {
  NEXT_PUBLIC_API_URL: 'https://sharefilescf-backend.your-subdomain.workers.dev',
},
```

### 2. Deploy via Git Integration (Recommended)

1. Push your code to GitHub/GitLab
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Click "Create a project"
4. Connect your Git repository
5. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `cd frontend && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`

### 3. Deploy via Wrangler (Alternative)

```bash
cd frontend
npm run build
npx @cloudflare/next-on-pages
wrangler pages deploy dist --project-name sharefilescf-frontend
```

## Custom Domain (Optional)

### 1. Add Custom Domain to Pages

1. Go to your Pages project dashboard
2. Click "Custom domains"
3. Add your domain (e.g., `share.yourdomain.com`)
4. Follow DNS configuration instructions

### 2. Add Custom Domain to Workers

1. Go to your Workers dashboard
2. Click on your worker
3. Go to "Triggers" tab
4. Add custom domain (e.g., `api.yourdomain.com`)

### 3. Update CORS Settings

Update your Workers environment variables:

```toml
[vars]
CORS_ORIGIN = "https://share.yourdomain.com"
```

## Environment-Specific Deployments

### Development Environment

```bash
# Backend
cd backend
wrangler dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

### Staging Environment

Create staging environments by duplicating your `wrangler.toml` configuration:

```toml
[env.staging]
name = "sharefilescf-backend-staging"
vars = { CORS_ORIGIN = "https://staging-sharefilescf.pages.dev" }
```

Deploy to staging:

```bash
wrangler deploy --env staging
```

## Monitoring and Maintenance

### 1. Set up Scheduled Cleanup

The Workers script includes automatic cleanup. To enable it, add a cron trigger:

```toml
[triggers]
crons = ["0 * * * *"]  # Run every hour
```

### 2. Monitor Usage

- **Workers Analytics**: View in Cloudflare dashboard
- **R2 Storage**: Monitor storage usage and costs
- **D1 Database**: Check query performance

### 3. Backup Strategy

- **Database**: Use `wrangler d1 export` for backups
- **R2 Storage**: Consider cross-region replication for critical files

## Security Considerations

1. **Rate Limiting**: Implement KV-based rate limiting
2. **File Type Validation**: Ensure only allowed file types are uploaded
3. **Size Limits**: Enforce reasonable file size limits
4. **CORS Configuration**: Restrict to your frontend domain only
5. **Regular Updates**: Keep dependencies updated

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `CORS_ORIGIN` environment variable
2. **Database Connection**: Verify D1 database ID in `wrangler.toml`
3. **File Upload Fails**: Check R2 bucket permissions and size limits
4. **Build Errors**: Ensure Node.js version compatibility

### Debugging

```bash
# View Workers logs
wrangler tail

# Check D1 database
wrangler d1 execute sharefiles-db --command "SELECT COUNT(*) FROM files"

# List R2 objects
wrangler r2 object list sharefiles-storage
```

## Cost Estimation

### Cloudflare Workers
- **Free Tier**: 100,000 requests/day
- **Paid**: $5/month for 10M requests

### Cloudflare D1
- **Free Tier**: 5M reads, 100K writes/day
- **Paid**: $5/month for 25M reads, 50M writes

### Cloudflare R2
- **Free Tier**: 10GB storage, 1M Class A operations/month
- **Paid**: $0.015/GB/month storage

### Cloudflare Pages
- **Free Tier**: 1 build per minute, 500 builds/month
- **Paid**: $20/month for unlimited builds

For a typical small to medium usage, the free tiers should be sufficient.

## Support

- **Documentation**: [Cloudflare Docs](https://developers.cloudflare.com)
- **Community**: [Cloudflare Discord](https://discord.gg/cloudflaredev)
- **Issues**: [GitHub Issues](https://github.com/yourusername/sharefilescf/issues)
