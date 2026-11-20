
'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";

type Article = {
  id: string;
  title: string;
  subject: string;
  description: string;
  authorName: string;
  createdAt: string;
  testType: string;
  featureImage?: string;
  access: "free" | "premium" | "pro";
};

function getUrlForLearnArticle(articleId: string) {
  return `/learn/${articleId}`;
}

export default function LearnClientPage({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <section className="relative w-full py-20 md:py-28 lg:py-36 text-white bg-hero-gradient">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter drop-shadow-lg wave-text">
            <span>Dive</span> <span>Deeper.</span> <span>Learn</span> <span>Smarter.</span>
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto drop-shadow-md">
            Strengthen your fundamentals with our comprehensive library of articles and tutorials. Expertly crafted content designed to clarify complex topics and accelerate your learning.
          </p>
        </div>
      </section>

      <div className="bg-background">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow bg-card-gradient text-white">
                <CardHeader className="p-0 relative h-48">
                  <Image
                    src={article.featureImage || `https://picsum.photos/seed/${article.id}/400/225`}
                    alt={article.title}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                    data-ai-hint={`${article.subject} abstract`}
                  />
                  <div className="absolute top-2 right-2">
                    <ContentBadge type={article.access} />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                  <p className="text-sm font-medium text-primary-foreground/80">{article.subject}</p>
                  <CardTitle className="font-headline text-xl mt-1 mb-2 leading-snug">{article.title}</CardTitle>
                  <p className="text-sm text-primary-foreground/70 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex items-center text-xs text-primary-foreground/60 space-x-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{article.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{article.createdAt}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full bg-quiz-button-gradient text-white">
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
      </div>
    </>
  );
}
