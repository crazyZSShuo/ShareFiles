'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FileText, Lock, Clock, Eye, AlertCircle, Copy, FileX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';
import { 
  formatDate, 
  formatTimeUntilExpiry, 
  copyToClipboard,
  isExpired 
} from '@/lib/utils';
import type { TextShareInfoResponse } from '@/types/api';
import toast from 'react-hot-toast';

export default function TextViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const textId = params.id as string;
  const errorParam = searchParams.get('error');
  
  const [textShare, setTextShare] = useState<TextShareInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    if (textId) {
      loadTextShare();
    }

    // Handle error parameter from URL
    if (errorParam === 'invalid_password') {
      toast.error('Invalid password provided');
      setNeedsPassword(true);
    } else if (errorParam === 'expired') {
      toast.error('This text share has expired and is no longer available');
      setError('This text share has expired');
    } else if (errorParam === 'view_limit_reached') {
      toast.error('View limit has been reached for this text share');
      setError('View limit reached');
    }
  }, [textId, errorParam]);

  const loadTextShare = async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedsPassword(false);
      
      // First try to get basic info
      const info = await api.getTextShareInfo(textId);
      
      if (info.has_password) {
        setNeedsPassword(true);
        setTextShare(info);
      } else {
        // If no password required, get full content
        await viewTextShare();
      }
    } catch (error) {
      console.error('Failed to load text share:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load text share');
      }
    } finally {
      setLoading(false);
    }
  };

  const viewTextShare = async () => {
    try {
      const content = await api.viewTextShare(textId, {
        password: password || undefined,
      });
      setTextShare(content);
      setNeedsPassword(false);
    } catch (error) {
      console.error('Failed to view text share:', error);
      if (error instanceof ApiError) {
        if (error.message.includes('password')) {
          setNeedsPassword(true);
          toast.error('Invalid password');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to view text share');
      }
    }
  };

  const handleCopyContent = async () => {
    if (textShare?.content) {
      try {
        await copyToClipboard(textShare.content);
        toast.success('Content copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy content');
      }
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      viewTextShare();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading text share...</p>
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
              Text Share Not Found
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

  if (!textShare) {
    return null;
  }

  const expired = isExpired(textShare.expires_at);
  const canView = !expired && !textShare.is_view_limit_reached;

  // Show password form if needed
  if (needsPassword && canView) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Lock className="w-6 h-6 text-gray-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Password Protected
                </h1>
                <p className="text-gray-600">
                  This text share requires a password to view
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to view content"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!password.trim()}
                className="w-full"
              >
                View Content
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-gray-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {textShare.title || 'Text Share'}
                </h1>
                <p className="text-gray-600">
                  {textShare.language} • {textShare.content.length.toLocaleString()} characters
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleCopyContent}
              disabled={!canView}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
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
            
            {textShare.is_view_limit_reached && (
              <div className="flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                View limit reached
              </div>
            )}
            
            {textShare.has_password && (
              <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Lock className="w-4 h-4 mr-1" />
                Password protected
              </div>
            )}
          </div>

          {/* Share details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium">{formatDate(textShare.created_at)}</p>
            </div>
            <div>
              <span className="text-gray-500">Expires:</span>
              <p className="font-medium">
                {expired ? 'Expired' : formatTimeUntilExpiry(textShare.expires_at)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Views:</span>
              <p className="font-medium">
                {textShare.view_count}
                {textShare.max_views && ` / ${textShare.max_views}`}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Language:</span>
              <p className="font-medium">{textShare.language}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {canView ? (
        <Card>
          <CardContent className="p-0">
            <pre className="p-6 text-sm bg-gray-50 rounded-lg overflow-x-auto whitespace-pre-wrap break-words">
              <code>{textShare.content}</code>
            </pre>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              {expired 
                ? 'This text share has expired and is no longer available.'
                : 'This text share has reached its view limit and is no longer available.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Privacy notice */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Privacy Notice</p>
              <p>
                This text share will be automatically deleted after expiration. 
                We don't track views or store any personal information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
