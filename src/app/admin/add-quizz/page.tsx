
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedAddQuizzPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/add-quiz');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>This page has been moved. Redirecting to the correct quiz creation page...</p>
        </div>
    );
}
