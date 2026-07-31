'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

const parseDate = (val: any) => {
  if (!val) return null;
  if (val.toDate) return val.toDate();
  if (val.seconds) return new Date(val.seconds * 1000);
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export default function BlogClientPage({ test }: { test: any }) {
  const router = useRouter();
  
  const displayDate = parseDate(test.publishedAt) || parseDate(test.createdAt);

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <header className="mb-8 text-center space-y-4">
          <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {test.title}
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {displayDate ? (
              <div className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                <span>
                  {format(displayDate, 'MMMM d, yyyy')}
                </span>
              </div>
            ) : null}
            {test.authorName && (
              <div className="flex items-center gap-1">
                <span>By {test.authorName}</span>
              </div>
            )}
          </div>
        </header>
        
        {test.featureImage && (
          <div className="mb-10 w-full rounded-xl overflow-hidden shadow-sm">
             <img 
               src={test.featureImage} 
               alt={test.title} 
               className="w-full h-auto object-cover max-h-[500px]" 
             />
          </div>
        )}
        
        <Card className="shadow-sm border border-border/50">
          <CardContent className="p-6 md:p-10">
            <div 
              className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-headline prose-a:text-primary hover:prose-a:text-primary/80"
              dangerouslySetInnerHTML={{ __html: test.description }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
