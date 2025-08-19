# ShareFilesCF API Documentation

Complete API reference for ShareFilesCF backend.

## Base URL

```
https://your-worker-name.your-subdomain.workers.dev
```

## Authentication

No authentication required. All endpoints are public but rate-limited.

## Rate Limits

- **File uploads**: 10 requests/hour per IP
- **Text shares**: 20 requests/hour per IP
- **Downloads**: 100 requests/hour per IP
- **General API**: 1000 requests/hour per IP

## File Upload API

### Upload File

Upload a file with optional settings.

**Endpoint:** `POST /api/upload`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required): The file to upload
- `expiry_hours` (optional): Hours until expiry (1-168, default: 24)
- `max_downloads` (optional): Maximum download count
- `password` (optional): Password protection

**Example:**
```bash
curl -X POST https://your-worker.workers.dev/api/upload \
  -F "file=@example.pdf" \
  -F "expiry_hours=48" \
  -F "max_downloads=5" \
  -F "password=secret123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "filename": "example.pdf",
    "size": 1048576,
    "expires_at": "2024-01-02T12:00:00.000Z",
    "download_url": "https://your-worker.workers.dev/api/download/abc123def456",
    "has_password": true
  }
}
```

## File Download API

### Get File Info

Get file metadata without downloading.

**Endpoint:** `GET /api/info/{id}`

**Example:**
```bash
curl https://your-worker.workers.dev/api/info/abc123def456
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "filename": "secure_filename.pdf",
    "original_filename": "example.pdf",
    "mime_type": "application/pdf",
    "size": 1048576,
    "created_at": "2024-01-01T12:00:00.000Z",
    "expires_at": "2024-01-02T12:00:00.000Z",
    "download_count": 2,
    "max_downloads": 5,
    "has_password": true,
    "is_expired": false,
    "is_download_limit_reached": false
  }
}
```

### Download File (POST)

Download a file with optional password.

**Endpoint:** `POST /api/download/{id}`

**Content-Type:** `application/json`

**Body:**
```json
{
  "password": "secret123"  // Optional
}
```

**Example:**
```bash
curl -X POST https://your-worker.workers.dev/api/download/abc123def456 \
  -H "Content-Type: application/json" \
  -d '{"password": "secret123"}' \
  --output downloaded_file.pdf
```

**Response:** Binary file data with appropriate headers

### Download File (GET)

Direct download link with optional password in query.

**Endpoint:** `GET /api/download/{id}?password={password}`

**Example:**
```bash
curl "https://your-worker.workers.dev/api/download/abc123def456?password=secret123" \
  --output downloaded_file.pdf
```

## Text Share API

### Create Text Share

Create a new text share.

**Endpoint:** `POST /api/text/create`

**Content-Type:** `application/json`

**Body:**
```json
{
  "title": "My Code Snippet",           // Optional
  "content": "console.log('Hello!');",  // Required
  "language": "javascript",             // Optional, default: "text"
  "expiry_hours": 24,                   // Optional, default: 24
  "max_views": 10,                      // Optional
  "password": "secret123"               // Optional
}
```

**Example:**
```bash
curl -X POST https://your-worker.workers.dev/api/text/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World",
    "content": "console.log(\"Hello, World!\");",
    "language": "javascript",
    "expiry_hours": 48
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "xyz789abc123",
    "title": "Hello World",
    "expires_at": "2024-01-03T12:00:00.000Z",
    "view_url": "https://your-worker.workers.dev/api/text/view/xyz789abc123",
    "has_password": false
  }
}
```

### Get Text Share Info

Get text share metadata without content.

**Endpoint:** `GET /api/text/info/{id}`

**Example:**
```bash
curl https://your-worker.workers.dev/api/text/info/xyz789abc123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "xyz789abc123",
    "title": "Hello World",
    "content": "console.log(\"Hello, World!\");",
    "language": "javascript",
    "created_at": "2024-01-01T12:00:00.000Z",
    "expires_at": "2024-01-03T12:00:00.000Z",
    "view_count": 3,
    "max_views": null,
    "has_password": false,
    "is_expired": false,
    "is_view_limit_reached": false
  }
}
```

### View Text Share (POST)

View text share content with optional password.

**Endpoint:** `POST /api/text/view/{id}`

**Content-Type:** `application/json`

**Body:**
```json
{
  "password": "secret123"  // Optional
}
```

**Example:**
```bash
curl -X POST https://your-worker.workers.dev/api/text/view/xyz789abc123 \
  -H "Content-Type: application/json" \
  -d '{"password": "secret123"}'
```

**Response:** Same as Get Text Share Info but increments view count

### View Text Share (GET)

Direct text content access.

**Endpoint:** `GET /api/text/view/{id}?password={password}`

**Example:**
```bash
curl "https://your-worker.workers.dev/api/text/view/xyz789abc123"
```

**Response:** Raw text content with `text/plain` content type

## Admin API

### Health Check

Check service health.

**Endpoint:** `GET /health`

**Example:**
```bash
curl https://your-worker.workers.dev/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### Cleanup Expired Items

Manually trigger cleanup of expired files and text shares.

**Endpoint:** `GET /admin/cleanup`

**Example:**
```bash
curl https://your-worker.workers.dev/admin/cleanup
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cleaned_files": 5,
    "cleaned_text_shares": 3,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### Storage Statistics

Get storage usage statistics.

**Endpoint:** `GET /admin/stats`

**Example:**
```bash
curl https://your-worker.workers.dev/admin/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "storage": {
      "totalFiles": 150,
      "totalSize": 52428800
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request parameters |
| 400 | `FILE_TOO_LARGE` | File exceeds size limit |
| 400 | `UNSUPPORTED_FILE_TYPE` | File type not allowed |
| 401 | `INVALID_PASSWORD` | Wrong password provided |
| 403 | `DOWNLOAD_LIMIT_REACHED` | Download limit exceeded |
| 403 | `VIEW_LIMIT_REACHED` | View limit exceeded |
| 404 | `FILE_NOT_FOUND` | File or text share not found |
| 410 | `FILE_EXPIRED` | Content has expired |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

## CORS

The API supports CORS for web applications. Configure the `CORS_ORIGIN` environment variable to your frontend domain.

## Content Types

### Supported File Types

- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Documents**: PDF, TXT, MD, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Archives**: ZIP, RAR, 7Z, TAR, GZIP
- **Code**: HTML, CSS, JS, JSON, XML
- **Audio**: MP3, WAV, OGG, MP4
- **Video**: MP4, WebM, OGG, MOV
- **Other**: Binary files (application/octet-stream)

### Text Share Languages

- `text` (default)
- `markdown`
- `javascript`
- `python`
- `html`
- `css`
- `json`
- `xml`
- `sql`
- `bash`

## Limits

- **File Size**: 10MB maximum
- **Text Content**: 1MB maximum
- **Expiry Time**: 1 hour to 7 days (168 hours)
- **Filename Length**: 255 characters
- **Password Length**: 100 characters maximum

## Examples

### Complete File Upload Flow

```bash
# 1. Upload file
RESPONSE=$(curl -s -X POST https://your-worker.workers.dev/api/upload \
  -F "file=@document.pdf" \
  -F "expiry_hours=72" \
  -F "password=mypassword")

# 2. Extract file ID
FILE_ID=$(echo $RESPONSE | jq -r '.data.id')

# 3. Get file info
curl https://your-worker.workers.dev/api/info/$FILE_ID

# 4. Download file
curl -X POST https://your-worker.workers.dev/api/download/$FILE_ID \
  -H "Content-Type: application/json" \
  -d '{"password": "mypassword"}' \
  --output downloaded.pdf
```

### Complete Text Share Flow

```bash
# 1. Create text share
RESPONSE=$(curl -s -X POST https://your-worker.workers.dev/api/text/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Example",
    "content": "This is example content",
    "language": "text",
    "expiry_hours": 24
  }')

# 2. Extract share ID
SHARE_ID=$(echo $RESPONSE | jq -r '.data.id')

# 3. View text share
curl -X POST https://your-worker.workers.dev/api/text/view/$SHARE_ID
```
