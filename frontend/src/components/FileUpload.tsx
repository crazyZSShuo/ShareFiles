// File upload component with drag and drop

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Lock, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';
import { formatFileSize, copyToClipboard, validatePassword, validateExpiryHours } from '@/lib/utils';
import type { UploadResponse } from '@/types/api';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadSuccess?: (result: UploadResponse) => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [expiryHours, setExpiryHours] = useState(24);
  const [maxDownloads, setMaxDownloads] = useState<number | undefined>();
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(true); // 默认启用密码保护
  const [useDownloadLimit, setUseDownloadLimit] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Store file and show confirmation dialog
    setPendingFile(file);
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmUpload = useCallback(async () => {
    if (!pendingFile) return;

    // Validate password (now required)
    if (!password || password.trim() === '') {
      toast.error('Password is required for file protection');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message || 'Invalid password');
      return;
    }

    // Validate expiry hours
    const expiryValidation = validateExpiryHours(expiryHours);
    if (!expiryValidation.valid) {
      toast.error(expiryValidation.message || 'Invalid expiry time');
      return;
    }

    setShowConfirmDialog(false);
    setUploading(true);

    try {
      const result = await api.uploadFile({
        file: pendingFile,
        expiry_hours: expiryHours,
        max_downloads: useDownloadLimit ? maxDownloads : undefined,
        password: password,
      });

      setUploadResult(result);
      onUploadSuccess?.(result);
      toast.success('File uploaded successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to upload file');
      }
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  }, [pendingFile, expiryHours, maxDownloads, password, useDownloadLimit, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: uploading,
  });

  const handleCopyLink = async () => {
    if (uploadResult) {
      try {
        await copyToClipboard(uploadResult.download_url);
        toast.success('Download link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const resetUpload = () => {
    setUploadResult(null);
    setPassword('');
    setUsePassword(false);
    setUseDownloadLimit(false);
    setMaxDownloads(undefined);
  };

  if (uploadResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <File className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              File Uploaded Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your file "{uploadResult.filename}" has been uploaded and is ready to share.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Download URL:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="text-primary-600 hover:text-primary-700"
                >
                  Copy Link
                </Button>
              </div>
              <div className="bg-white border rounded p-2 text-sm font-mono break-all">
                {uploadResult.download_url}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Expires: {new Date(uploadResult.expires_at).toLocaleDateString()}
              </div>
              {uploadResult.has_password && (
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  Password Protected
                </div>
              )}
            </div>

            <Button onClick={resetUpload} variant="outline">
              Upload Another File
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-lg text-primary-600">Drop the file here...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-600 mb-2">
                Drag & drop a file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: 10MB
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Expiry (hours)"
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              min={1}
              max={168}
              helperText="1-168 hours (7 days max)"
            />
            
            <div>
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={useDownloadLimit}
                  onChange={(e) => setUseDownloadLimit(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Limit downloads
                </span>
              </label>
              {useDownloadLimit && (
                <Input
                  type="number"
                  placeholder="Max downloads"
                  value={maxDownloads || ''}
                  onChange={(e) => setMaxDownloads(Number(e.target.value) || undefined)}
                  min={1}
                />
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={usePassword}
                onChange={(e) => setUsePassword(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={true} // 强制启用密码保护
              />
              <span className="text-sm font-medium text-gray-700">
                Password protect (Required)
              </span>
            </label>
            <Input
              type="password"
              placeholder="Enter password (required)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {uploading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center text-primary-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              Uploading...
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && pendingFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm File Upload
              </h3>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  You are about to upload:
                </p>
                <div className="bg-gray-50 rounded p-3">
                  <p className="font-medium">{pendingFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(pendingFile.size)} • {pendingFile.type}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Settings:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Expires in {expiryHours} hours</li>
                  {useDownloadLimit && maxDownloads && (
                    <li>• Max downloads: {maxDownloads}</li>
                  )}
                  <li>• Password protected: {password ? 'Yes' : 'No'}</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setPendingFile(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpload}
                  disabled={!password || password.trim() === ''}
                  className="flex-1"
                >
                  Upload File
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
