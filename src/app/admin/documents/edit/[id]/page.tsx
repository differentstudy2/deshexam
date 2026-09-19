'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DocumentUploadForm } from '@/components/admin/DocumentUploadForm';
import { ArrowLeft, FileEdit, Library, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, 'guide_documents', resolvedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInitialData(docSnap.data());
        } else {
          toast({ title: 'Not found', description: 'Document not found.', variant: 'destructive' });
          router.push('/admin/documents');
        }
      } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [resolvedParams.id, router, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020817]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817]">
      {/* Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin/documents">
            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-amber-500" />
              Edit Document
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update {initialData.title}
            </p>
          </div>
          <Link href="/admin/documents">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Library className="w-3.5 h-3.5" /> View Library
            </Button>
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <DocumentUploadForm
            initialData={initialData}
            documentId={resolvedParams.id}
            onSaved={() => {
              setTimeout(() => router.push('/admin/documents'), 1800);
            }}
          />
        </div>
      </div>
    </div>
  );
}
