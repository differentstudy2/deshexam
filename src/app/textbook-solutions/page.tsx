

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import type { Textbook } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { Book, Edit } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TextbookSolutionsListPage() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTextbooks = async () => {
      setLoading(true);
      const textbooksCollectionRef = collection(db, 'textbooks');
      const querySnapshot = await getDocs(textbooksCollectionRef);
      const textbooksData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Textbook)
      );
      setTextbooks(textbooksData);
      setLoading(false);
    };

    fetchTextbooks();
  }, []);

  if (loading) {
    return <div className="container mx-auto py-8">Loading textbooks...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
       <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Textbook Solutions</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Select a textbook to view its solutions, topics, and practice questions.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {textbooks.map((book) => (
          <Card key={book.id} className="overflow-hidden">
            <CardHeader className="p-0">
                <Image
                    src={book.featureImage || `https://picsum.photos/seed/${book.id}/400/225`}
                    alt={book.title}
                    width={400}
                    height={225}
                    className="w-full h-48 object-cover"
                />
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><Book /> {book.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{book.description}</p>
            </CardContent>
            <CardContent className="p-4 pt-0">
                <Button asChild className="w-full">
                    <Link href={`/textbook-solutions/${book.id}`}>View Solutions</Link>
                </Button>
            </CardContent>
          </Card>
        ))}
         {textbooks.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
                <p>No textbooks found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
