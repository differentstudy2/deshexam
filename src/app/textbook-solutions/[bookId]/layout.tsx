
'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// This layout will handle nested routes within [bookId]
export default function TextbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="w-8 h-8 animate-spin"/></div>}>
        {children}
    </Suspense>
  );
}
