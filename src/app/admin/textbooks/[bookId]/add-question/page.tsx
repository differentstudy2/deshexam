// This page is no longer used and can be removed. The logic has been moved into a dialog
// on src/app/admin/textbooks/[bookId]/questions/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedAddQuestionPage() {
    const router = useRouter();
    useEffect(() => {
        // Redirect to the main questions page, as this page's logic is now in a dialog there.
        const pathSegments = window.location.pathname.split('/');
        const textbookId = pathSegments[pathSegments.indexOf('textbooks') + 1];
        if (textbookId) {
            router.replace(`/admin/textbooks/${textbookId}/questions`);
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
