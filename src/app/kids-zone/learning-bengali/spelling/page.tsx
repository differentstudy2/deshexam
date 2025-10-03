
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PenTool } from "lucide-react";
import Link from "next/link";

export default function BengaliSpellingPage() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-bengali">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Bengali
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-indigo-600">
            বানান কৌশল (Spelling)
          </h1>
          <p className="text-lg text-indigo-700/80 mt-4 max-w-2xl mx-auto">
            Master Bengali spelling with interactive exercises.
          </p>
        </header>
        <Card className="max-w-2xl mx-auto text-center p-8 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardContent>
                <PenTool className="w-16 h-16 mx-auto text-indigo-400 mb-4"/>
                <h3 className="text-2xl font-bold text-slate-800">Coming Soon!</h3>
                <p className="text-muted-foreground mt-2">
                    Exciting spelling games and activities are being created and will be available here soon.
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
