
'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { ContentBadge } from '@/components/content-badge';
import { useParams } from 'next/navigation';
import { getKidsCategoryBySlug } from '@/lib/firebase/firestore';

type ContentItem = {
  id: string;
  title: string;
  description?: string;
  subject: string;
  testType: string | string[];
  access: "free" | "premium" | "pro";
  featureImage?: string;
  category: string;
  questions?: any[]; // To match demo object
};

const demoContent: ContentItem[] = [
  {
    id: 'demo-game-1',
    title: 'Addition Adventure (Demo)',
    description: 'Practice your addition skills in this exciting adventure game!',
    category: 'Learning Games',
    testType: 'Kids Zone',
    subject: 'Math',
    featureImage: 'https://picsum.photos/seed/demo-game-math/400/300',
    access: 'free',
    questions: [],
  },
];


export default function KidsZoneCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategoryAndContent = async () => {
      if (!slug) return;
      setLoading(true);
      
      let finalCategoryName = '';
      
      try {
        const category = await getKidsCategoryBySlug(slug);

        if (category) {
          finalCategoryName = category.title;
        } else {
          // Fallback for hardcoded categories or categories created before slug field
          finalCategoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        setCategoryName(finalCategoryName);

        const queries = [];
        const contentCollection = collection(db, "content");

        // Base query by category name
        queries.push(query(contentCollection, where("category", "==", finalCategoryName)));

        // Add special logic for hardcoded categories to also fetch by testType
        if (finalCategoryName === "Fun Quizzes") {
            queries.push(query(contentCollection, where("testType", "==", "Quiz")));
            queries.push(query(contentCollection, where("testType", "array-contains", "Quiz")));
        }
        
        if (finalCategoryName === "Learning Games") {
            // Add any special logic for learning games if needed in future
        }

        const querySnapshots = await Promise.all(queries.map(q => getDocs(q)));
        
        const contentMap = new Map<string, ContentItem>();
        querySnapshots.forEach(snapshot => {
            snapshot.docs.forEach(doc => {
                if (!contentMap.has(doc.id)) {
                    contentMap.set(doc.id, { id: doc.id, ...doc.data() } as ContentItem);
                }
            });
        });

        const fetchedContent = Array.from(contentMap.values());
        
        // Filter demo content for the current category and add if not already present
        const demoItemsForCategory = demoContent.filter(item => item.category === finalCategoryName);
        demoItemsForCategory.forEach(demoItem => {
            if (!fetchedContent.some(dbItem => dbItem.title === demoItem.title)) {
                fetchedContent.push(demoItem);
            }
        });
        
        setContent(fetchedContent);

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load content",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryAndContent();
  }, [slug, toast]);


  const getLinkForItem = (item: ContentItem) => {
    if (item.id === 'demo-game-1') {
      return '/kids-zone/learning-games/math-puzzles/addition-adventure';
    }

    const primaryType = Array.isArray(item.testType) ? item.testType[0] : item.testType;
    
    if (primaryType === 'Kids Zone') {
      return `/content/${item.id}`;
    }
    if (primaryType === 'Quiz') {
      return `/quiz/${item.id}`;
    }
    if (!primaryType) {
        return `/content/${item.id}`; // A sensible fallback
    }
    const typeSlug = primaryType.toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${item.id}`;
  };

  return (
    <div className="bg-secondary/30">
      <section className="relative w-full py-20 md:py-28 lg:py-36 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter drop-shadow-lg">
            {categoryName || <Skeleton className="h-16 w-3/4 mx-auto" />}
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-2xl mx-auto drop-shadow-md">
            Explore fun and educational activities in the {categoryName} category.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
             <Button asChild variant="ghost">
                <Link href="/kids-zone">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Kids Zone
                </Link>
            </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="flex flex-col overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 flex-grow space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter className="p-4 pt-0 mt-auto">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : content.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.map((item) => (
              <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <CardHeader className="p-0 relative h-48">
                  <Image
                    src={item.featureImage || `https://picsum.photos/seed/${item.id}/400/300`}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <ContentBadge type={item.access} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="font-headline text-xl mt-1 mb-2 leading-snug transition-colors group-hover:text-primary">
                    {item.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.description}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 mt-auto">
                   <Button asChild className="w-full">
                     <Link href={getLinkForItem(item)}>Let's Go!</Link>
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No activities found in the "{categoryName}" category yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
