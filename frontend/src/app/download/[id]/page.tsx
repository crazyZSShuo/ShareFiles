'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Download, Lock, Clock, Eye, AlertCircle, FileX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';
import { 
  formatFileSize, 
  formatDate, 
  formatTimeUntilExpiry, 
  getFileIcon, 
  downloadBlob,
  isExpired 
} from '@/lib/utils';
import type { FileInfoResponse } from '@/types/api';
import toast from 'react-hot-toast';

export default function DownloadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const fileId = params.id as string;
  const errorParam = searchParams.get('error');
  
  const [fileInfo, setFileInfo] = useState<FileInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fileId) {
      loadFileInfo();
    }

    // Handle error parameter from URL
    if (errorParam === 'invalid_password') {
      toast.error('Invalid password provided');
    } else if (errorParam === 'expired') {
      toast.error('This file has expired and is no longer available');
    } else if (errorParam === 'download_limit_reached') {
      toast.error('Download limit has been reached for this file');
    }
  }, [fileId, errorParam]);

  const loadFileInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await api.getFileInfo(fileId);
      setFileInfo(info);
    } catch (error) {
      console.error('Failed to load file info:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load file information');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileInfo) return;

    try {
      setDownloading(true);
      const blob = await api.downloadFile(fileId, {
        password: fileInfo.has_password ? password : undefined,
      });
      
      downloadBlob(blob, fileInfo.original_filename);
      toast.success('File downloaded successfully!');
      
      // Reload file info to update download count
      await loadFileInfo();
      
    } catch (error) {
      console.error('Download error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to download file');
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading file information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <FileX className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              File Not Found
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!fileInfo) {
    return null;
  }

  const expired = isExpired(fileInfo.expires_at);
  const canDownload = !expired && !fileInfo.is_download_limit_reached;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {getFileIcon(fileInfo.mime_type)}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {fileInfo.original_filename}
              </h1>
              <p className="text-gray-600">
                {formatFileSize(fileInfo.size)} • {fileInfo.mime_type}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status indicators */}
          <div className="flex flex-wrap gap-2">
            {expired && (
              <div className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                Expired
              </div>
            )}
            
            {fileInfo.is_download_limit_reached && (
              <div className="flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                Download limit reached
              </div>
            )}
            
            {fileInfo.has_password && (
              <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Lock className="w-4 h-4 mr-1" />
                Password protected
              </div>
            )}
          </div>

          {/* File details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Uploaded:</span>
              <p className="font-medium">{formatDate(fileInfo.created_at)}</p>
            </div>
            <div>
              <span className="text-gray-500">Expires:</span>
              <p className="font-medium">
                {expired ? 'Expired' : formatTimeUntilExpiry(fileInfo.expires_at)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Downloads:</span>
              <p className="font-medium">
                {fileInfo.download_count}
                {fileInfo.max_downloads && ` / ${fileInfo.max_downloads}`}
              </p>
            </div>
            <div>
              <span className="text-gray-500">File ID:</span>
              <p className="font-medium font-mono text-xs">{fileInfo.id}</p>
            </div>
          </div>

          {/* Password input */}
          {fileInfo.has_password && canDownload && (
            <div>
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to download"
              />
            </div>
          )}

          {/* Download button */}
          <div className="pt-4">
            {canDownload ? (
              <Button
                onClick={handleDownload}
                loading={downloading}
                disabled={fileInfo.has_password && !password}
                className="w-full"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download File
              </Button>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {expired 
                    ? 'This file has expired and is no longer available for download.'
                    : 'This file has reached its download limit and is no longer available.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Privacy Notice</p>
              <p>
                This file will be automatically deleted after expiration. 
                We don't track downloads or store any personal information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
