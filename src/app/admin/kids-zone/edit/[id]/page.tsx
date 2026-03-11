
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated. The functionality has been moved to a dialog
// in `src/app/admin/kids-zone/manage/page.tsx`.
export default function DeprecatedEditKidsContentPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/kids-zone/manage');
    }, [router]);

    return (
         <div className="flex h-screen items-center justify-center">
            <p>Redirecting to Kids Zone Management...</p>
        </div>
    );
}
