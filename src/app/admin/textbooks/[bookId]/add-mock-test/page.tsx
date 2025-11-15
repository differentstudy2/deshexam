
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated. The functionality has been moved to a dialog
// in `src/app/admin/textbooks/[bookId]/mock-tests/page.tsx`.
export default function DeprecatedAddMockTestPage() {
    const router = useRouter();
    useEffect(() => {
        const pathSegments = window.location.pathname.split('/');
        const textbookId = pathSegments[pathSegments.indexOf('textbooks') + 1];
        if (textbookId) {
            router.replace(`/admin/textbooks/${textbookId}/mock-tests`);
        } else {
            router.replace('/admin/textbooks');
        }
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting...</p>
        </div>
    );
}
