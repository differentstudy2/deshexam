
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getChaptersByTextbookId } from '@/lib/firebase/firestore';
import type { Chapter } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function AddQuestionToChapterPage() {
    const params = useParams();
    const router = useRouter();
    const textbookId = params.bookId as string;
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChapters = async () => {
            setLoading(true);
            const chaptersData = await getChaptersByTextbookId(textbookId);
            setChapters(chaptersData);
            setLoading(false);
        };
        fetchChapters();
    }, [textbookId]);

    const handleContinue = () => {
        if (selectedChapter) {
            router.push(`/admin/textbooks/${textbookId}/chapter/${selectedChapter}/questions/add`);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-4">
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}/questions`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to All Questions
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Question</CardTitle>
                    <CardDescription>
                        First, select the chapter where you want to add the question.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-2">
                         <div className="flex-grow space-y-2">
                            <label htmlFor="chapter-select" className="text-sm font-medium">Chapter</label>
                            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                                <SelectTrigger id="chapter-select">
                                    <SelectValue placeholder="Select a chapter..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {chapters.map(chap => (
                                        <SelectItem key={chap.id} value={chap.id}>{chap.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <Button onClick={handleContinue} disabled={!selectedChapter}>Continue</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
