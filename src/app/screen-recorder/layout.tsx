import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Online Screen Recorder in 4K | DeshExam',
  description: 'The fastest and easiest way to capture high-quality 4K videos of your screen, camera, and microphone. 100% free online screen recorder, no downloads necessary.',
  keywords: 'screen recorder, free screen recorder, online screen recorder, 4k screen recording, video capture, record screen with audio, deshexam screen recorder',
  openGraph: {
    title: 'Free Online Screen Recorder in 4K | DeshExam',
    description: 'Capture high-quality 4K videos of your screen instantly in your browser. 100% free, no watermark.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Screen Recorder in 4K | DeshExam',
    description: 'Capture high-quality 4K videos of your screen instantly in your browser. 100% free, no watermark.',
  }
};

export default function ScreenRecorderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
