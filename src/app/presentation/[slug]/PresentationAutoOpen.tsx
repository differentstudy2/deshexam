'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHardcodedTaxonomyNodes } from '@/data/hardcoded/taxonomy';
import PresentationOverlay from '@/components/assessment/PresentationOverlay';

interface Assessment {
    id: string;
    title: string;
    slug: string;
    questions: any[];
    classId?: string;
    chapter?: string;
    topic?: string;
    boardId?: string;
    subjectId?: string;
    textbookId?: string;
    chapterId?: string;
    topicId?: string;
}

export default function PresentationAutoOpen({ assessment }: { assessment: Assessment }) {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

    const getTaxonomyTitle = (id?: string) => {
        if (!id) return null;
        if (/^[a-zA-Z0-9]{20}$/.test(id)) return null;
        const nodes = getHardcodedTaxonomyNodes();
        const node = nodes.find(n => n.id === id);
        return node ? node.title : id;
    };

    const handleClose = () => {
        setIsOpen(false);
        router.push('/presentation');
    };

    if (!isOpen) return null;

    return (
        <PresentationOverlay
            questions={assessment.questions}
            classLine={assessment.title || assessment.classId || "Class Info"}
            chapterName={[
                getTaxonomyTitle(assessment.boardId) || assessment.boardId, 
                getTaxonomyTitle(assessment.classId) || assessment.classId, 
                getTaxonomyTitle(assessment.subjectId) || assessment.subjectId
            ].filter(Boolean).join(' • ')}
            topicName={[
                getTaxonomyTitle(assessment.textbookId) || assessment.textbookId, 
                assessment.chapter || getTaxonomyTitle(assessment.chapterId) || assessment.chapterId, 
                assessment.topic || getTaxonomyTitle(assessment.topicId) || assessment.topicId
            ].filter(Boolean).join(' • ')}
            autoStart={true}
            onClose={handleClose}
            isPremiumUser={true}
        />
    );
}
