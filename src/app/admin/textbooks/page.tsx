'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import type { Textbook } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { Book, Edit } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ManageTextbooksPage() {
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
    return <div>Loading textbooks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Manage Textbooks</h1>
          <p className="text-muted-foreground">
            A list of all textbooks available on the platform.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {textbooks.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Book /> {book.title}</CardTitle>
              <CardDescription>{book.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href={`/admin/textbooks/${book.id}`}>Manage Chapters</Link>
                </Button>
            </CardContent>
          </Card>
        ))}
         {textbooks.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
                <p>No textbooks found. Add one from the main content editor.</p>
            </div>
        )}
      </div>
    </div>
  );
}
