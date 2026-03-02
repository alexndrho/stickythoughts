import type { NextConfig } from 'next';
import { withBotId } from 'botid/next/config';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/threads',
        destination: '/letters',
        permanent: true,
      },
      {
        source: '/threads/:path*',
        destination: '/letters/:path*',
        permanent: true,
      },
    ];
  },
};

export default withBotId(nextConfig);
