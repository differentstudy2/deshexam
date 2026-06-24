import React from 'react';
import { getTaxonomyNodesByType } from '@/lib/firebase/taxonomy';
import { ClassDashboard } from '@/components/guide/ClassDashboard';

export const dynamic = 'force-dynamic';

export default async function GuideClassPage() {
  const classes = await getTaxonomyNodesByType('academic', 'class');
  
  // Serialize to prevent Server Component serialization errors with Firestore Timestamps
  const serializedClasses = JSON.parse(JSON.stringify(classes));

  return <ClassDashboard classes={serializedClasses} />;
}
