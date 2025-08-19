// API client for communicating with the backend

import type {
  ApiResponse,
  UploadResponse,
  TextShareCreateResponse,
  FileInfoResponse,
  TextShareInfoResponse,
  UploadFileRequest,
  CreateTextShareRequest,
  DownloadFileRequest,
  ViewTextShareRequest,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData.code
    );
  }

  const data: ApiResponse<T> = await response.json();
  
  if (!data.success) {
    throw new ApiError(data.error || 'API request failed', response.status);
  }

  return data.data as T;
}

export const api = {
  // File operations
  async uploadFile(request: UploadFileRequest): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    
    if (request.expiry_hours) {
      formData.append('expiry_hours', request.expiry_hours.toString());
    }
    
    if (request.max_downloads) {
      formData.append('max_downloads', request.max_downloads.toString());
    }
    
    if (request.password) {
      formData.append('password', request.password);
    }

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }

    const data: ApiResponse<UploadResponse> = await response.json();
    
    if (!data.success) {
      throw new ApiError(data.error || 'Upload failed', response.status);
    }

    return data.data as UploadResponse;
  },

  async getFileInfo(id: string): Promise<FileInfoResponse> {
    return apiRequest<FileInfoResponse>(`/api/info/${id}`);
  },

  async downloadFile(id: string, request: DownloadFileRequest = {}): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/download/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }

    return response.blob();
  },

  // Text share operations
  async createTextShare(request: CreateTextShareRequest): Promise<TextShareCreateResponse> {
    return apiRequest<TextShareCreateResponse>('/api/text/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getTextShareInfo(id: string): Promise<TextShareInfoResponse> {
    return apiRequest<TextShareInfoResponse>(`/api/text/info/${id}`);
  },

  async viewTextShare(id: string, request: ViewTextShareRequest = {}): Promise<TextShareInfoResponse> {
    return apiRequest<TextShareInfoResponse>(`/api/text/view/${id}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

export { ApiError };
