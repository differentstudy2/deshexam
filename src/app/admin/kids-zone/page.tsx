
'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function KidsZoneAdminPage() {
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
