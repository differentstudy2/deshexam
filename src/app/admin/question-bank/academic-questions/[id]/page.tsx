'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QuestionBankEditor } from '@/components/admin/QuestionBankEditor';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { getQuestion } from '@/lib/firebase/question-bank';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EditAcademicQuestionPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = params.id as string;
    
    const [initialData, setInitialData] = useState<Partial<QuestionBankEntry> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!id) return;
            try {
                const q = await getQuestion(id);
                if (q) {
                    setInitialData(q);
                } else {
                    toast({ title: 'Question not found', variant: 'destructive' });
                    router.push('/admin/question-bank/questions');
                }
            } catch (err: any) {
                toast({ title: 'Error loading question', description: err.message, variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, [id, router, toast]);

    if (loading || !initialData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
            <QuestionBankEditor 
                initialData={initialData} 
                onSaveComplete={() => router.push('/admin/question-bank/questions')}
                onCancel={() => router.back()}
                title="Edit Academic Question"
                breadcrumbs={['Admin', 'Question Bank', 'Academic Questions', 'Edit Question']}
                defaultContentType="academic"
            />
        </div>
    );
}
