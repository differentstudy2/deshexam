'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function StartTestButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
    // Navigate immediately after requesting fullscreen
    router.push(`/mock-tests/${slug}/take`);
  };

  return (
    <Button 
      onClick={handleStart} 
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg rounded-xl transition-all"
    >
      {isLoading ? (
        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Launching Exam...</>
      ) : (
        <><PlayCircle className="w-5 h-5 mr-2" /> Start Mock Test</>
      )}
    </Button>
  );
}
