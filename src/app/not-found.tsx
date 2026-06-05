

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
      <TriangleAlert className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-6xl font-bold font-headline text-destructive">404</h1>
      <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or maybe you just mistyped the URL.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Go Back to Homepage</Link>
      </Button>
    </div>
  );
}
