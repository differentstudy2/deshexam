
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
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
    ],
  },
  async rewrites() {
    return [
      {
        source: '/mock-test/:id*',
        destination: '/content/:id*',
      },
      {
        source: '/quiz/:id*',
        destination: '/content/:id*',
      },
      {
        source: '/exam/:id*',
        destination: '/content/:id*',
      },
      {
        source: '/textbook-solutions/:bookId/exam/:examId',
        destination: '/textbook-solutions/exam/:examId/textbook/:bookId',
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
        source: '/textbook-solutions/practice-set/:practiceSetId/textbook/:bookId',
        destination: '/textbook-solutions/practice-set/:practiceSetId/textbook/:bookId/chapter/null/topic/null',
      },
      {
        source: '/textbook-solutions/mock-test/:mockTestId/textbook/:bookId/chapter/:chapterId/topic/:topicId',
        destination: '/textbook-solutions/mock-test/:mockTestId/textbook/:bookId/chapter/:chapterId/topic/:topicId',
      },
       {
        source: '/textbook-solutions/:bookId/practice-set/:practiceSetId',
        destination: '/textbook-solutions/practice-set/:practiceSetId/textbook/:bookId/chapter/null/topic/null',
      },
    ];
  }
};

export default nextConfig;

    