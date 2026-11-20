'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserBookmarkedQuestions } from '@/lib/firebase/question-bank';
import QuestionFeed from '@/components/question-bank/QuestionFeed';
import { DocCard, PDFPreviewModal } from '@/app/documents/DocumentsClient';
import { useSaveDocument } from '@/hooks/use-save-document';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { BookMarked, FileText } from 'lucide-react';

export default function BookmarksPage() {
    const { user, loading: authLoading } = useAuth();
    const { savedDocs, isSaved, toggleSave, loading: savesLoading } = useSaveDocument();
    
    const [questions, setQuestions] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    
    const [fetchingQs, setFetchingQs] = useState(true);
    const [fetchingDocs, setFetchingDocs] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'questions' | 'documents'>('questions');
    const [previewDoc, setPreviewDoc] = useState<any>(null);

    // Fetch Questions
    useEffect(() => {
        if (!authLoading) {
            if (user) {
                getUserBookmarkedQuestions(user.uid).then(qs => {
                    setQuestions(qs);
                    setFetchingQs(false);
                }).catch(err => {
                    console.error(err);
                    setFetchingQs(false);
                });
            } else {
                setFetchingQs(false);
            }
        }
    }, [user, authLoading]);

    // Fetch Documents
    useEffect(() => {
        const fetchDocs = async () => {
            if (!savedDocs.length) {
                setDocuments([]);
                setFetchingDocs(false);
                return;
            }
            setFetchingDocs(true);
            try {
                // Firestore 'in' query supports max 10 elements. To keep it simple, we batch them.
                const batches = [];
                for (let i = 0; i < savedDocs.length; i += 10) {
                    batches.push(savedDocs.slice(i, i + 10));
                }
                
                let allDocs: any[] = [];
                for (const batch of batches) {
                    const q = query(collection(db, 'guide_documents'), where(documentId(), 'in', batch));
                    const snap = await getDocs(q);
                    const batchDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    allDocs = [...allDocs, ...batchDocs];
                }
                setDocuments(allDocs);
            } catch (err) {
                console.error("Failed to fetch saved documents", err);
            } finally {
                setFetchingDocs(false);
            }
        };

        if (!savesLoading) {
            fetchDocs();
        }
    }, [savedDocs, savesLoading]);

    const isLoading = authLoading || fetchingQs || (activeTab === 'documents' && (savesLoading || fetchingDocs));

    return (
        <div className="w-full flex flex-col items-center pb-20 bg-slate-50 dark:bg-[#020817] min-h-screen">
            <div className="container max-w-5xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-100">Saved Items</h1>
                
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-px">
                    <button 
                        onClick={() => setActiveTab('questions')}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                            activeTab === 'questions' 
                            ? 'border-[#107c41] text-[#107c41]' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        <BookMarked className="w-4 h-4" />
                        Questions
                    </button>
                    <button 
                        onClick={() => setActiveTab('documents')}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                            activeTab === 'documents' 
                            ? 'border-[#107c41] text-[#107c41]' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        Documents
                    </button>
                </div>

                {!user && !authLoading ? (
                    <div className="text-center py-20 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        Please log in to view your saved items.
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#107c41]"></div>
                    </div>
                ) : activeTab === 'questions' ? (
                    questions.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            No saved questions yet. Click the Save icon on questions to save them here!
                        </div>
                    ) : (
                        <QuestionFeed initialQuestions={questions} title="" />
                    )
                ) : (
                    documents.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            No saved documents yet. Explore the document library and bookmark items!
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {documents.map(doc => (
                                <DocCard 
                                    key={doc.id} 
                                    doc={doc} 
                                    onPreview={setPreviewDoc}
                                    isSaved={isSaved(doc.id)}
                                    onToggleSave={() => toggleSave(doc.id)}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>

            {previewDoc && (
                <PDFPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
            )}
        </div>
    );
}
