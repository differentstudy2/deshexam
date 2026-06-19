"use client";

import { useAuth } from '@/hooks/use-auth';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface AudioPlayerPaywallProps {
  audioUrl: string;
  allowDownload?: boolean;
  isPremium?: boolean;
  previewDuration?: number; // In seconds
}

export function AudioPlayerPaywall({ audioUrl, allowDownload, isPremium, previewDuration = 0 }: AudioPlayerPaywallProps) {
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();

  // Mocking premium status check: For now, if the item is premium, 
  // we require the user to be logged in. (Replace with actual premium flag later)
  const isUserPremium = !!user; 

  const showPaywall = isPremium && !isUserPremium;
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // If there's a paywall, is the preview exhausted?
  // If previewDuration is 0, it's exhausted immediately.
  const [previewExhausted, setPreviewExhausted] = useState(showPaywall && previewDuration <= 0);
  const [wasLocked, setWasLocked] = useState(showPaywall);

  // Autoplay UX: When the paywall unlocks, automatically start playing the audio!
  useEffect(() => {
    if (wasLocked && !showPaywall) {
      setPreviewExhausted(false);
      if (audioRef.current) {
        // We use a small timeout to ensure the 'src' has been hydrated before calling play
        setTimeout(() => {
          audioRef.current?.play().catch(() => {
            console.log("Browser prevented autoplay after unlock.");
          });
        }, 300);
      }
      setWasLocked(false);
    }
  }, [showPaywall, wasLocked]);

  const handleTimeUpdate = () => {
    if (!showPaywall || previewDuration <= 0) return;
    
    if (audioRef.current && audioRef.current.currentTime >= previewDuration) {
      audioRef.current.pause();
      if (!previewExhausted) {
        setPreviewExhausted(true);
      }
      // Keep it clamped at previewDuration
      if (audioRef.current.currentTime > previewDuration + 0.5) {
        audioRef.current.currentTime = previewDuration;
      }
    }
  };

  const handleSeeking = () => {
    if (!showPaywall || previewDuration <= 0) return;
    if (audioRef.current && audioRef.current.currentTime > previewDuration) {
      audioRef.current.pause();
      audioRef.current.currentTime = previewDuration;
      setPreviewExhausted(true);
    }
  };

  return (
    <div className="relative bg-slate-950 p-4 border-t border-slate-800 flex flex-col justify-center min-h-[80px]">
      
      {/* Free Preview Badge */}
      {showPaywall && !previewExhausted && previewDuration > 0 && (
         <div className="absolute top-0 right-4 -translate-y-1/2 bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full z-20 shadow-md border border-slate-900">
           Free Preview: {previewDuration}s
         </div>
      )}

      {/* Lock Overlay when preview is exhausted */}
      {showPaywall && previewExhausted ? (
        <div className="absolute inset-0 z-10 flex flex-col sm:flex-row items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-4 p-4 border-t border-slate-800 transition-all duration-500">
          <div className="flex items-center gap-2 text-amber-400">
            <Lock className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wide">PREMIUM TRACK</span>
          </div>
          <div className="flex items-center gap-2">
            {!user ? (
              <Button 
                onClick={() => openAuthDialog('sign-in')} 
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-full h-8 px-4 text-xs font-semibold"
              >
                Sign in to Unlock
              </Button>
            ) : (
              <Link href="/pricing">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-8 px-4 text-xs font-semibold">
                  Upgrade to Pass Pro
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : null}

      <div className={cn("w-full transition-all duration-300", showPaywall && previewExhausted && "opacity-20 pointer-events-none select-none blur-[2px]")}>
        <audio 
          ref={audioRef}
          controls 
          controlsList={allowDownload && !showPaywall ? "" : "nodownload"}
          className="w-full h-12 [&::-webkit-media-controls-panel]:bg-slate-100" 
          src={audioUrl} 
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
}
