import type {NextConfig} from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  /* config options here */
  // Phase 6: gzip/brotli compression for HTML + assets served by Next.
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent optional 'canvas' module from causing server-side errors
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }
    return config;
  },

  images: {
    // Phase 6: serve modern formats first; keep the default responsive sizes.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days for optimised images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'testbook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'archive.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Phase 9: security headers. No CSP is set on purpose — a strict CSP
  // would break inline scripts, AdSense and the Razorpay checkout script;
  // CSP is a follow-up that needs allow-listing those first.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/mock-test/:id*',
        destination: '/content/:id*',
      },
      {
        source: '/blog/:id*',
        destination: '/content/:id*',
      },
      {
        source: '/job/:id*',
        destination: '/content/:id*',
      },
      {
        source: '/news/:id*',
        destination: '/content/:id*',
      },
      // {
      //   source: '/quiz/:id*',
      //   destination: '/content/:id*',
      // },
      {
        source: '/exam/:id*',
        destination: '/content/:id*',
      },
      {
        source: '/textbook-solutions/:bookId/exam/:examId',
        destination: '/textbook-solutions/exam/:examId/textbook/:bookId',
      },
      {
        source: '/:bookId/text-practice-sets/:practiceSetId',
        destination: '/content/:practiceSetId',
      },
      {
        source: '/textbook-solutions/:bookId/quiz/:quizId',
        destination: '/textbook-solutions/quiz/:quizId/textbook/:bookId',
      },
      {
        source: '/practice-questions/:id*',
        destination: '/content/:id*',
      },
      {
        source: '/textbook-solutions/mock-test/:mockTestId/textbook/:bookId/chapter/:chapterId/topic/:topicId',
        destination: '/textbook-solutions/mock-test/:mockTestId/textbook/:bookId/chapter/:chapterId/topic/:topicId',
      },
    ];
  }
};

export default withPWA(nextConfig);
