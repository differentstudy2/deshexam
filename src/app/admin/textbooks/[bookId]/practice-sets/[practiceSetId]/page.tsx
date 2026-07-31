
'use client';

import { Suspense, use } from 'react';
import { Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import PracticeSetClientPage from './practice-set-client-page';

// This is a server component that fetches the data.
export default function PracticeSetPage(props: { params: Promise<{ bookId: string, practiceSetId: string }>}) {
    const params = use(props.params);
    // The actual data fetching and passing will happen inside the Suspense boundary
    // For now, we just pass the params to the client component which will handle its own fetching.

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <PracticeSetClientPage 
                textbookId={params.bookId}
                practiceSetId={params.practiceSetId}
            />
        </Suspense>
    )
}
