
'use client';

import { Suspense } from 'react';
import AddContentForm from '@/app/admin/add-content/page';

export default function AddTextbookExamPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddContentForm />
        </Suspense>
    )
}
