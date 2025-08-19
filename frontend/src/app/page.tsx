'use client';

import React, { useState } from 'react';
import { Upload, FileText, Shield, Clock, Zap, Globe } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { TextShare } from '@/components/TextShare';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Share Files{' '}
            <span className="text-primary-600">Securely</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Modern file sharing service with automatic expiration, password protection,
            and no account required. Fast, secure, and privacy-focused.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => {
                setActiveTab('file');
                document.getElementById('main-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload File
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setActiveTab('text');
                document.getElementById('main-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8"
            >
              <FileText className="w-5 h-5 mr-2" />
              Share Text
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose FileVault?
          </h2>
          <p className="text-lg text-gray-600">
            Built with privacy and security in mind
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Password protection, automatic deletion, and no tracking.
                Your privacy is our priority.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Auto-Expiring
              </h3>
              <p className="text-gray-600">
                Files automatically delete after expiration. Set custom expiry
                times from 1 hour to 7 days.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Optimized for speed with global content delivery for fast uploads
                and downloads worldwide.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Upload/Share Section */}
      <section id="main-section" className="py-12">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setActiveTab('file')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'file'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-4 h-4 mr-2 inline" />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'text'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                Share Text
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="fade-in">
            {activeTab === 'file' ? <FileUpload /> : <TextShare />}
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-12 bg-white rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Technical Details
          </h2>
          <p className="text-gray-600">
            Built with modern technologies for reliability and performance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
            <p className="text-sm text-gray-600">Next.js 14 + Tailwind CSS</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
            <p className="text-sm text-gray-600">Serverless API</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Database</h3>
            <p className="text-sm text-gray-600">SQLite Database</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Storage</h3>
            <p className="text-sm text-gray-600">Object Storage</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <Globe className="w-4 h-4 mr-2" />
            Powered by Modern Web Technologies
          </div>
        </div>
      </section>
    </div>
  );
}
