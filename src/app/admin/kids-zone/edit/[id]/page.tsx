
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
