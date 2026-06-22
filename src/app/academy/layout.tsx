import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Academy Dashboard | DeshExam',
  description: 'Explore comprehensive academic materials, textbooks, chapters, and topics designed to help you prepare effectively. Find MCQ, CQ, and PDF notes for your class.',
  keywords: 'Academy, DeshExam, Textbook, Board Exams, MCQ, Creative Questions, PDF Notes, Online Learning Bangladesh',
  openGraph: {
    title: 'Academy Dashboard | DeshExam',
    description: 'Explore comprehensive academic materials, textbooks, chapters, and topics.',
    url: 'https://deshexam.com/academy',
    siteName: 'DeshExam',
    images: [
      {
        url: 'https://deshexam.com/og-academy.png', // Replace with actual image url if available
        width: 1200,
        height: 630,
        alt: 'DeshExam Academy Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Academy Dashboard | DeshExam',
    description: 'Explore comprehensive academic materials, textbooks, chapters, and topics.',
    images: ['https://deshexam.com/og-academy.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://deshexam.com/academy',
  },
};

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
