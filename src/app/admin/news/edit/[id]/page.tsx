'use client';

import { PostEditor } from '@/components/admin/PostEditor';
import { useEffect, useState } from 'react';
import { getContentById } from '@/lib/firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';

export default function EditNewsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getContentById(id);
        if (data) {
          setInitialData(data);
        } else {
          toast({ variant: 'destructive', title: 'Not found', description: 'News post not found.' });
          router.push('/admin/news');
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch news post.' });
        router.push('/admin/news');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PostEditor 
      contentType="News" 
      backUrl="/admin/news" 
      initialData={initialData}
      contentId={id}
    />
  );
}
