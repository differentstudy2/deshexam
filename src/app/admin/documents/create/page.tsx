'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DocumentUploadForm } from '@/components/admin/DocumentUploadForm';
import { ArrowLeft, FolderOpen, Library } from 'lucide-react';

export default function CreateDocumentPage() {
  const router = useRouter();

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
              <FolderOpen className="w-5 h-5 text-amber-500" />
              Upload New Document
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload once → appear in Document Library & any attached Curriculum topic
            </p>
          </div>
          <Link href="/admin/documents">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Library className="w-3.5 h-3.5" /> View Library
            </Button>
          </Link>
        </div>
      </div>

      {/* How it works banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-6 text-xs font-medium text-amber-800 dark:text-amber-300">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">1</span>
            Upload file
          </span>
          <span className="text-amber-300">→</span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">2</span>
            Saved to Document Library
          </span>
          <span className="text-amber-300">→</span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">3</span>
            Attach to any topic from Curriculum
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <DocumentUploadForm
            onSaved={() => {
              setTimeout(() => router.push('/admin/documents'), 1800);
            }}
          />
        </div>
      </div>
    </div>
  );
}
