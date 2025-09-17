'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TestResultsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-12">
        <header className="text-center mb-8">
            <h1 className="font-headline text-4xl font-bold">Test Results</h1>
            <p className="text-muted-foreground">Here's how you performed on the test.</p>
        </header>
      <Card className="min-h-[400px] flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground p-6">
            <Award className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-semibold text-foreground">Results Coming Soon!</h3>
            <p className="mb-4">
              The ability to submit tests and view your detailed results is under construction.
            </p>
            <Button asChild>
                <Link href="/mock-tests">Back to Mock Tests</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
