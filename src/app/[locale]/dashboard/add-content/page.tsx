

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/lib/firebase/firestore';

export default function OldAddContentPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        const checkAdminAndRedirect = async () => {
            if (loading) return;

            if (user) {
                const userProfile = await getUserProfile(user.uid);
                if (userProfile && userProfile.role === 'admin') {
                    router.replace('/admin/add-content');
                } else {
                    router.replace('/dashboard');
                }
            } else {
                router.replace('/sign-in');
            }
        };

        checkAdminAndRedirect();
    }, [user, loading, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting...</p>
        </div>
    );
}
