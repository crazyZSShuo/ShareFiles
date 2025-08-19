# ShareFilesCF - Modern File Sharing Service

A modern, secure file sharing service built with Cloudflare Workers and Pages. Share files and text content securely with automatic expiration and no account required.

[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare-orange)](https://deploy.workers.cloudflare.com/?url=https://github.com/yourusername/sharefilescf)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## ✨ Features

- 📁 **File Sharing**: Upload and share files up to 10MB
- 📝 **Text Sharing**: Share code snippets, notes, and text content
- ⏰ **Auto-Expiry**: Files automatically delete after 1 hour to 7 days
- 🔒 **Password Protection**: Optional password security for sensitive content
- 📊 **Download/View Limits**: Control access with maximum counts
- 🚫 **No Accounts**: Anonymous sharing, no registration required
- 🌍 **Global CDN**: Fast worldwide access via Cloudflare's network
- 📱 **Responsive Design**: Works perfectly on all devices
- 🔐 **Privacy First**: No tracking, minimal data collection
- 🚀 **Serverless**: Built on modern serverless architecture

## 🏗️ Architecture

- **Backend**: Cloudflare Workers + D1 Database + R2 Storage
- **Frontend**: Next.js 14 + Tailwind CSS (deployed on Cloudflare Pages)
- **Language**: TypeScript throughout
- **Database**: SQLite-based D1 with automatic scaling
- **Storage**: S3-compatible R2 with zero egress fees
- **CDN**: Global edge network for optimal performance

## 项目结构

```
ShareFilesCF/
├── frontend/          # Next.js 前端应用
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
├── backend/           # Cloudflare Workers 后端
│   ├── src/
│   ├── wrangler.toml
│   └── package.json
├── database/          # D1 数据库迁移文件
│   └── migrations/
└── docs/             # 项目文档
```

## 🚀 Quick Start

Get up and running in 5 minutes! See our [Quick Start Guide](docs/QUICK_START.md) for detailed instructions.

```bash
# 1. Clone and install
git clone https://github.com/yourusername/sharefilescf.git
cd sharefilescf
npm install

# 2. Set up Cloudflare resources
./scripts/setup.sh

# 3. Deploy
./scripts/deploy.sh
```

## 📖 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 5 minutes
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Detailed deployment instructions
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Security Guide](docs/SECURITY.md)** - Security best practices
- **[Performance Guide](docs/PERFORMANCE.md)** - Optimization tips

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:8787
```

### Testing

```bash
# Run all tests
npm test

# Run specific tests
npm run test:frontend
npm run test:backend

# Type checking
npm run type-check
```

## 🌟 Demo

Try the live demo: [sharefilescf.pages.dev](https://sharefilescf.pages.dev)

### Example Usage

**File Sharing:**
1. Drag & drop a file or click to select
2. Set expiry time (1 hour to 7 days)
3. Optional: Add password protection
4. Optional: Set download limits
5. Share the generated link

**Text Sharing:**
1. Paste your text content
2. Choose language for syntax highlighting
3. Set expiry and view limits
4. Optional: Add password protection
5. Share the generated link

## 🔒 Privacy & Security

- **No User Accounts**: Anonymous sharing by design
- **Automatic Deletion**: Files expire and are permanently deleted
- **No Tracking**: No analytics, cookies, or user tracking
- **Password Protection**: Optional encryption for sensitive content
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Secure URLs**: Unpredictable file identifiers
- **HTTPS Only**: All traffic encrypted in transit

## 📊 Limits

| Feature | Limit |
|---------|-------|
| File Size | 10MB |
| Text Content | 1MB |
| Expiry Time | 1 hour - 7 days |
| File Uploads | 10/hour per IP |
| Text Shares | 20/hour per IP |
| Downloads | 100/hour per IP |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Cloudflare](https://cloudflare.com) for the amazing serverless platform
- [Next.js](https://nextjs.org) for the excellent React framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Hono](https://hono.dev) for the lightweight web framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/sharefilescf/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/sharefilescf/discussions)
- **Documentation**: [docs/](docs/)

---

**Built with ❤️ using Cloudflare Workers and Pages**
