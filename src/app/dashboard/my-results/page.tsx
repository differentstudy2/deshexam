'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function MyResultsPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">My Results</h1>
      <p className="text-muted-foreground mb-6">
        Review your performance on all the tests you have taken.
      </p>
      <Card className="min-h-[400px] flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No Results Yet</h3>
            <p>You have not completed any tests yet. Once you do, your results will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
