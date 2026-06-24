import React from 'react';
import { Metadata } from 'next';
import { getTaxonomyNodesByType } from '@/lib/firebase/taxonomy';
import { ClassDashboard } from '@/components/guide/ClassDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Choose Your Class | DeshExam Academy',
  description: 'Explore board-wise textbooks, subjects, notes, MCQ, CQ, practice tests, and chapter-wise learning resources for School, Primary, Secondary, and Higher Secondary classes.',
  keywords: 'deshexam academy, classes, primary class, secondary class, higher secondary, online learning, mock tests',
  openGraph: {
    title: 'Choose Your Class | DeshExam Academy',
    description: 'Explore board-wise textbooks, subjects, notes, MCQ, CQ, practice tests, and chapter-wise learning resources.',
    type: 'website',
  }
};

export default async function GuideClassPage() {
  const classes = await getTaxonomyNodesByType('academic', 'class');
  
  // Serialize to prevent Server Component serialization errors with Firestore Timestamps
  const serializedClasses = JSON.parse(JSON.stringify(classes));

  return <ClassDashboard classes={serializedClasses} />;
}
