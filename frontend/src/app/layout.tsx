import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FileVault - Secure File Sharing',
  description: 'Modern file sharing service with automatic expiration and password protection. Share files and text content securely with no account required.',
  keywords: ['file sharing', 'secure', 'temporary', 'privacy', 'vault'],
  authors: [{ name: 'FileVault' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'FileVault - Secure File Sharing',
    description: 'Share files and text content securely with automatic expiration',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FileVault - Secure File Sharing',
    description: 'Share files and text content securely with automatic expiration',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="6" width="24" height="20" rx="3" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1"/>
                      <circle cx="16" cy="16" r="4" fill="#1E40AF"/>
                      <circle cx="16" cy="16" r="2" fill="#FFFFFF"/>
                      <rect x="12" y="12" width="8" height="8" rx="1" fill="#FFFFFF" fillOpacity="0.2"/>
                      <rect x="13" y="14" width="6" height="1" fill="#FFFFFF" fillOpacity="0.6"/>
                      <rect x="13" y="16" width="4" height="1" fill="#FFFFFF" fillOpacity="0.6"/>
                      <rect x="13" y="18" width="5" height="1" fill="#FFFFFF" fillOpacity="0.6"/>
                      <circle cx="8" cy="10" r="1" fill="#1E40AF"/>
                      <circle cx="24" cy="10" r="1" fill="#1E40AF"/>
                      <circle cx="8" cy="22" r="1" fill="#1E40AF"/>
                      <circle cx="24" cy="22" r="1" fill="#1E40AF"/>
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">
                    FileVault
                  </h1>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                  <a
                    href="/"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Home
                  </a>
                  <a
                    href="/about"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    About
                  </a>
                  <span className="text-gray-400 text-sm">
                    v1.0.0
                  </span>
                </nav>
              </div>
            </div>
          </header>

          <main className="container py-8">
            {children}
          </main>

          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="container py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">FileVault</h3>
                  <p className="text-gray-600 text-sm">
                    Secure file sharing service built with modern web technologies.
                    Share files and text content with automatic expiration.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Automatic file expiration</li>
                    <li>• Password protection</li>
                    <li>• Download/view limits</li>
                    <li>• No account required</li>
                    <li>• Privacy focused</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Privacy</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Files auto-delete after expiry</li>
                    <li>• No tracking or analytics</li>
                    <li>• Minimal data collection</li>
                    <li>• Privacy-first design</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
                <p>
                  © 2024 FileVault. Built with ❤️ using modern web technologies.
                </p>
              </div>
            </div>
          </footer>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
