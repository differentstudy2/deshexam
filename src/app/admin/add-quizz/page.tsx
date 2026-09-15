
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedAddQuizzPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/add-content');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>This page has been moved. Redirecting to the correct content creation page...</p>
        </div>
    );
}
