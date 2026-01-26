
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, Calendar } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";
import { getAllContent } from "@/lib/firebase/firestore";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn',
  description: 'Expand your knowledge with our curated collection of in-depth articles and tutorials on a wide range of subjects. Perfect for building a strong foundation.',
  keywords: ['learn', 'articles', 'tutorials', 'study guides', 'educational content'],
};

function getUrlForLearnArticle(articleId: string) {
  return `/learn/${articleId}`;
}

export default async function LearnPage() {
  const articles = await getAllContent("Learn");

  return (
    <div className="container py-12 md:py-16">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Learn</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Expand your knowledge with our curated collection of articles and tutorials.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: any) => (
          <Card key={article.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
            <CardHeader className="p-0 relative">
              <Image
                src={article.featureImage || `https://picsum.photos/seed/${article.id}/400/225`}
                alt={article.title}
                width={400}
                height={225}
                className="w-full h-auto object-cover"
                data-ai-hint={`${article.subject} abstract`}
              />
              <div className="absolute top-2 right-2">
                <ContentBadge type={article.access as "free" | "premium" | "pro"} />
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <p className="text-sm font-medium text-primary">{article.subject}</p>
              <CardTitle className="font-headline text-lg mt-1 mb-2 leading-snug">{article.title}</CardTitle>
              <CardDescription>{article.description}</CardDescription>
              <div className="flex items-center text-sm text-muted-foreground space-x-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{article.authorName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{article.createdAt}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full">
                <Link href={getUrlForLearnArticle(article.id)}>Read More</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {articles.length === 0 && (
            <div className="col-span-full text-center py-16">
                <h3 className="text-xl font-semibold">No articles yet</h3>
                <p className="text-muted-foreground">Check back soon for new content!</p>
            </div>
        )}
      </div>
    </div>
  );
}
