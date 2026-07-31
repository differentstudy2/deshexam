
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldCouponsPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/coupons');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting to the new coupons page...</p>
        </div>
    );
}
