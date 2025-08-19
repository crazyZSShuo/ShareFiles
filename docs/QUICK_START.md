# ShareFilesCF Quick Start Guide

Get ShareFilesCF up and running in minutes!

## Prerequisites

- **Node.js** 18 or higher
- **Cloudflare Account** (free tier works)
- **Git** for version control

## 🚀 Quick Setup (5 minutes)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/sharefilescf.git
cd sharefilescf
npm install
```

### 2. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 3. Set Up Cloudflare Resources

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This script will:
- Create D1 database
- Create R2 bucket
- Create KV namespace
- Run database migrations
- Configure environment variables

### 4. Deploy

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 5. Update Frontend API URL

After backend deployment, update `frontend/next.config.js`:

```javascript
env: {
  NEXT_PUBLIC_API_URL: 'https://your-worker-name.your-subdomain.workers.dev',
},
```

Then redeploy the frontend:

```bash
./scripts/deploy.sh --frontend-only
```

## 🎉 You're Done!

Your ShareFilesCF instance is now live! Check your Cloudflare dashboard for the URLs.

## 📱 Features Overview

### File Sharing
- **Drag & Drop Upload**: Modern file upload interface
- **Auto-Expiry**: Files automatically delete (1 hour to 7 days)
- **Password Protection**: Optional password security
- **Download Limits**: Set maximum download counts
- **10MB File Limit**: Suitable for most use cases

### Text Sharing
- **Rich Text Support**: Share code, markdown, plain text
- **Syntax Highlighting**: Multiple language support
- **View Limits**: Control how many times text can be viewed
- **Password Protection**: Secure sensitive content

### Privacy & Security
- **No Accounts Required**: Anonymous sharing
- **Automatic Cleanup**: Files delete after expiration
- **No Tracking**: Privacy-focused design
- **Secure URLs**: Unpredictable file identifiers

## 🛠️ Development

### Local Development

```bash
# Start backend (terminal 1)
cd backend
npm run dev

# Start frontend (terminal 2)
cd frontend
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:8787

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# All tests
npm test
```

### Project Structure

```
sharefilescf/
├── frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/ # React components
│   │   ├── lib/       # Utilities and API client
│   │   └── types/     # TypeScript types
│   └── package.json
├── backend/           # Cloudflare Workers backend
│   ├── src/
│   │   ├── handlers/  # API route handlers
│   │   ├── services/  # Business logic
│   │   ├── utils/     # Utility functions
│   │   └── types/     # TypeScript types
│   └── wrangler.toml  # Worker configuration
├── database/          # D1 database migrations
├── scripts/           # Deployment scripts
└── docs/             # Documentation
```

## 🔧 Configuration

### Environment Variables (Backend)

Edit `backend/wrangler.toml`:

```toml
[vars]
CORS_ORIGIN = "https://your-frontend-domain.pages.dev"
MAX_FILE_SIZE = "10485760"  # 10MB
DEFAULT_EXPIRY_HOURS = "24"
MAX_EXPIRY_HOURS = "168"    # 7 days
```

### Frontend Configuration

Edit `frontend/next.config.js`:

```javascript
env: {
  NEXT_PUBLIC_API_URL: 'https://your-backend.workers.dev',
},
```

## 📊 Monitoring

### Cloudflare Dashboard
- **Workers Analytics**: Monitor API usage
- **Pages Analytics**: Track frontend performance
- **R2 Storage**: Monitor storage usage
- **D1 Database**: Check query performance

### Health Checks
- Backend: `https://your-worker.workers.dev/health`
- Database cleanup: `https://your-worker.workers.dev/admin/cleanup`
- Storage stats: `https://your-worker.workers.dev/admin/stats`

## 🔒 Security

### Best Practices
- Keep dependencies updated
- Monitor for security alerts
- Use strong CORS policies
- Enable rate limiting
- Regular security audits

### Rate Limits (Default)
- File uploads: 10/hour per IP
- Text shares: 20/hour per IP
- Downloads: 100/hour per IP

## 🚨 Troubleshooting

### Common Issues

**CORS Errors**
```bash
# Check CORS_ORIGIN in wrangler.toml
wrangler secret put CORS_ORIGIN
```

**Database Connection**
```bash
# Verify database ID
wrangler d1 list
# Update wrangler.toml with correct ID
```

**File Upload Fails**
```bash
# Check R2 bucket
wrangler r2 bucket list
# Verify bucket name in wrangler.toml
```

### Debug Commands

```bash
# View Worker logs
wrangler tail

# Check database
wrangler d1 execute sharefiles-db --command "SELECT COUNT(*) FROM files"

# List R2 objects
wrangler r2 object list sharefiles-storage

# Test API endpoints
curl https://your-worker.workers.dev/health
```

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)**: Detailed deployment instructions
- **[Security Guide](./SECURITY.md)**: Security best practices
- **[Performance Guide](./PERFORMANCE.md)**: Optimization tips
- **[API Documentation](./API.md)**: Complete API reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community support and questions
- **Documentation**: Comprehensive guides and examples

---

**Happy sharing! 🎉**

Built with ❤️ using Cloudflare Workers and Pages.
