
'use client';

import { useEffect, useState } from 'react';
import { getContentById } from '@/lib/firebase/firestore';
import { Loader2, ArrowLeft, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plate, PlateProvider } from '@udecode/plate-common';


type Article = {
  id: string;
  title: string;
  subject: string;
  description: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  testType: string;
};

export default function LearnArticlePage() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      try {
        setLoading(true);
        const articleData = await getContentById(articleId);
        if (articleData && articleData.testType === 'Learn') {
          setArticle(articleData as Article);
        } else {
          throw new Error("Article not found or is not a 'Learn' type content.");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching article',
          description: (error as Error).message,
        });
        router.push('/learn');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, toast, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center min-h-[calc(100vh-200px)] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Article not found</h2>
        <p className="text-muted-foreground">The article you are looking for does not exist.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline">
          <Link href="/learn">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </Button>
      </div>
    );
  }

  const initialBodyValue = article.body ? JSON.parse(article.body) : [{ type: 'p', children: [{ text: '' }] }];

  return (
    <div className="container py-12">
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <div className="mb-4">
                    <Link href="/learn" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Back to all articles
                    </Link>
                </div>
                <p className="text-primary font-semibold">{article.subject}</p>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mt-1">{article.title}</h1>
                <p className="text-muted-foreground text-lg mt-3">{article.description}</p>
                <div className="flex items-center text-sm text-muted-foreground space-x-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={`https://picsum.photos/seed/${article.authorId}/24/24`} />
                        <AvatarFallback>{article.authorName?.[0]}</AvatarFallback>
                      </Avatar>
                      <span>{article.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Published on {article.createdAt}</span>
                    </div>
                </div>
            </header>

            <Image
                src={`https://picsum.photos/seed/${article.id}/800/450`}
                alt={article.title}
                width={800}
                height={450}
                className="w-full h-auto object-cover rounded-lg mb-8 shadow-lg"
                data-ai-hint={`${article.subject} concept`}
                priority
            />

            <div className="prose dark:prose-invert lg:prose-xl max-w-none">
              <PlateProvider initialValue={initialBodyValue}>
                <Plate readOnly />
              </PlateProvider>
            </div>
        </div>
    </div>
  );
}
