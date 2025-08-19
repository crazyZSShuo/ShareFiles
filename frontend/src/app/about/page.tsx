'use client';

import React from 'react';
import { Shield, Clock, Zap, Heart, Globe, Lock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About FileVault
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A modern, secure, and privacy-focused file sharing service built with
          cutting-edge technologies. No accounts required, automatic expiration,
          and complete privacy protection.
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Core Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Automatic Expiration
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Files and text shares automatically delete after expiration (1 hour to 7 days). 
                    No manual cleanup required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Password Protection
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Optional password protection for sensitive files and text content. 
                    Passwords are securely hashed and never stored in plain text.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Privacy First
                  </h3>
                  <p className="text-gray-600 text-sm">
                    No tracking, no analytics, no user accounts. We collect minimal data 
                    and automatically delete everything after expiration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Global Performance
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Built on Cloudflare's global network with edge computing for 
                    fast uploads and downloads worldwide.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technical Architecture */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Technical Architecture
        </h2>
        
        <Card>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
                <p className="text-sm text-gray-600 mb-2">Next.js 14 + Tailwind CSS</p>
                <p className="text-xs text-gray-500">
                  Modern React framework with server-side rendering and static generation
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
                <p className="text-sm text-gray-600 mb-2">Cloudflare Workers</p>
                <p className="text-xs text-gray-500">
                  Serverless edge computing with global distribution and instant scaling
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Database</h3>
                <p className="text-sm text-gray-600 mb-2">Cloudflare D1</p>
                <p className="text-xs text-gray-500">
                  SQLite-based serverless database with global replication
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Storage</h3>
                <p className="text-sm text-gray-600 mb-2">Cloudflare R2</p>
                <p className="text-xs text-gray-500">
                  S3-compatible object storage with zero egress fees
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Privacy & Security */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Privacy & Security
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">What We Collect</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• File metadata (name, size, type)</li>
                <li>• Upload timestamp and expiry time</li>
                <li>• Optional password hash (if set)</li>
                <li>• Download/view counts</li>
                <li>• IP address (for rate limiting only)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">What We Don't Collect</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• User accounts or profiles</li>
                <li>• Analytics or tracking cookies</li>
                <li>• File content analysis</li>
                <li>• Personal information</li>
                <li>• Usage patterns or behavior</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="text-center">
        <Card>
          <CardContent className="p-8">
            <Globe className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Modern Technology Stack
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Built with cutting-edge technologies for optimal performance,
              security, and scalability on modern serverless infrastructure.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <strong>Frontend</strong><br />
                Next.js 14
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <strong>Backend</strong><br />
                Serverless API
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <strong>Database</strong><br />
                SQLite
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <strong>Storage</strong><br />
                Object Storage
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact */}
      <section className="text-center">
        <Card>
          <CardContent className="p-8">
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Built with Privacy in Mind
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ShareFilesCF was created to provide a simple, secure, and private way to share files 
              without compromising your data or privacy. No ads, no tracking, no data mining.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
