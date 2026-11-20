
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AskQuestionPage() {
    const router = useRouter();

    useEffect(() => {
        // This page is deprecated. The functionality has been moved to a dialog
        // in `src/app/questions/page.tsx`. Redirecting there.
        router.replace('/questions');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting...</p>
        </div>
    );
}
