'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedAddQuizPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/add-content');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>This page is no longer in use. Redirecting to the main content creation page...</p>
        </div>
    );
}
