
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// This page is deprecated. The functionality has been moved to a dialog
// in `src/app/admin/textbooks/[bookId]/mock-tests/page.tsx`.
export default function DeprecatedAddMockTestPage() {
    const router = useRouter();
    const params = useParams();
    const textbookId = params.bookId as string;

    useEffect(() => {
        if (textbookId) {
            router.replace(`/admin/textbooks/${textbookId}/mock-tests`);
        } else {
            router.replace('/admin/textbooks');
        }
    }, [router, textbookId]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting...</p>
        </div>
    );
}
