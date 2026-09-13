'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PresentationOverlay from '@/components/assessment/PresentationOverlay';

interface Assessment {
    id: string;
    title: string;
    slug: string;
    questions: any[];
    classId?: string;
    chapter?: string;
    topic?: string;
}

export default function PresentationAutoOpen({ assessment }: { assessment: Assessment }) {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

    const handleClose = () => {
        setIsOpen(false);
        // Navigate back to the presentation list or previous page when closed
        router.push('/presentation');
    };

    if (!isOpen) return null;

    return (
        <PresentationOverlay
            questions={assessment.questions}
            classLine={assessment.classId || "Class Info"}
            chapterName={assessment.chapter || assessment.title}
            topicName={assessment.topic || "General"}
            autoStart={true}
            onClose={handleClose}
            isPremiumUser={true}
        />
    );
}
