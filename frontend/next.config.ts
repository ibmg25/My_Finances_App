import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Prevent Next.js from issuing 308 redirects to remove trailing slashes.
  // Without this, fetch('/api/auth/token/') → 308 → '/api/auth/token' → the
  // rewrite proxy chain breaks and the backend never receives the request.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        // :path(.*) captures the full remaining path including trailing slashes.
        // :path* would strip the trailing slash, causing Django 404s when
        // APPEND_SLASH=False is set (our dev setting).
        source: '/api/:path(.*)',
        destination: 'http://backend:8000/api/:path',
      },
    ];
  },
};

export default nextConfig;
