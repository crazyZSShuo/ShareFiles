# FileVault Frontend Deployment Guide

## 🚀 Deploying to Cloudflare Pages

### Prerequisites
- Cloudflare account
- Git repository with your frontend code
- Backend API deployed and accessible

### Step 1: Prepare Your Repository
1. Ensure all changes are committed to your Git repository
2. Push to your preferred Git hosting service (GitHub, GitLab, etc.)

### Step 2: Create Cloudflare Pages Project
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Choose **Connect to Git**
5. Select your repository

### Step 3: Configure Build Settings
- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `frontend` (if deploying from monorepo)

### Step 4: Set Environment Variables
In the Cloudflare Pages project settings, add the following environment variable:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.workers.dev` | Your backend API URL |

**Important**: Replace `your-backend-url.workers.dev` with your actual backend URL.

### Step 5: Deploy
1. Click **Save and Deploy**
2. Wait for the build to complete
3. Your site will be available at `https://your-project.pages.dev`

## 🛠️ Local Development

### Setup
1. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.workers.dev
   ```

3. Install dependencies and start development server:
   ```bash
   npm install
   npm run dev
   ```

## 🔧 Custom Domain (Optional)

To use a custom domain:
1. In Cloudflare Pages, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain name
4. Follow the DNS configuration instructions

## 📝 Notes

- The `NEXT_PUBLIC_API_URL` environment variable is required for the application to work
- Environment variables with `NEXT_PUBLIC_` prefix are exposed to the browser
- Make sure your backend CORS settings allow requests from your frontend domain
