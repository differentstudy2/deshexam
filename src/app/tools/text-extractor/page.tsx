import type { Metadata } from 'next';
import { TextExtractorUI } from '@/components/tools/TextExtractorUI';

export const metadata: Metadata = {
  title: 'Image & PDF Text Extractor - DeshExam',
  description: 'Extract text from images and PDF documents easily using high-quality OCR on DeshExam.',
  keywords: ['text extractor', 'ocr', 'image to text', 'pdf to text', 'deshexam tools'],
  alternates: {
    canonical: 'https://deshexam.com/tools/text-extractor',
  }
};

export default function TextExtractorPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-muted/10">
      <div className="pt-24 pb-16">
        <TextExtractorUI />
      </div>
    </div>
  );
}
