// Text sharing component

import React, { useState } from 'react';
import { FileText, Lock, Clock, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';
import { copyToClipboard, validatePassword, validateExpiryHours } from '@/lib/utils';
import type { TextShareCreateResponse } from '@/types/api';
import toast from 'react-hot-toast';

interface TextShareProps {
  onShareSuccess?: (result: TextShareCreateResponse) => void;
}

export function TextShare({ onShareSuccess }: TextShareProps) {
  const [creating, setCreating] = useState(false);
  const [shareResult, setShareResult] = useState<TextShareCreateResponse | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('text');
  const [expiryHours, setExpiryHours] = useState(24);
  const [maxViews, setMaxViews] = useState<number | undefined>();
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(true); // 默认启用密码保护
  const [useViewLimit, setUseViewLimit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    if (content.length > 1000000) {
      toast.error('Content is too long (max 1MB)');
      return;
    }

    // Validate password (now required)
    if (!password || password.trim() === '') {
      toast.error('Password is required for content protection');
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

    setCreating(true);
    
    try {
      const result = await api.createTextShare({
        title: title.trim() || undefined,
        content: content.trim(),
        language,
        expiry_hours: expiryHours,
        max_views: useViewLimit ? maxViews : undefined,
        password: password,
      });
      
      setShareResult(result);
      onShareSuccess?.(result);
      toast.success('Text share created successfully!');
      
    } catch (error) {
      console.error('Text share creation error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create text share');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareResult) {
      try {
        await copyToClipboard(shareResult.view_url);
        toast.success('Share link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const resetForm = () => {
    setShareResult(null);
    setTitle('');
    setContent('');
    setLanguage('text');
    setPassword('');
    setUsePassword(false);
    setUseViewLimit(false);
    setMaxViews(undefined);
  };

  if (shareResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Text Share Created Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your text {shareResult.title ? `"${shareResult.title}"` : ''} has been shared and is ready to view.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Share URL:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Link
                </Button>
              </div>
              <div className="bg-white border rounded p-2 text-sm font-mono break-all">
                {shareResult.view_url}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Expires: {new Date(shareResult.expires_at).toLocaleDateString()}
              </div>
              {shareResult.has_password && (
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  Password Protected
                </div>
              )}
            </div>

            <Button onClick={resetForm} variant="outline">
              Create Another Share
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Share Text Content
        </h2>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your text share"
            maxLength={200}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type your content here..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              rows={8}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              {content.length.toLocaleString()} characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language/Type
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="text">Plain Text</option>
                <option value="markdown">Markdown</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="sql">SQL</option>
                <option value="bash">Bash</option>
              </select>
            </div>

            <Input
              type="number"
              label="Expiry (hours)"
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              min={1}
              max={168}
              helperText="1-168 hours (7 days max)"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={useViewLimit}
                onChange={(e) => setUseViewLimit(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Limit views
              </span>
            </label>
            {useViewLimit && (
              <Input
                type="number"
                placeholder="Max views"
                value={maxViews || ''}
                onChange={(e) => setMaxViews(Number(e.target.value) || undefined)}
                min={1}
              />
            )}
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

          <Button
            type="submit"
            loading={creating}
            disabled={!content.trim() || !password.trim() || creating}
            className="w-full"
          >
            Create Text Share
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
