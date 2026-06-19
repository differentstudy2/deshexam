"use client";

import { useAuth } from '@/hooks/use-auth';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { Lock, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AudioPlayerPaywallProps {
  audioUrl: string;
  allowDownload?: boolean;
  isPremium?: boolean;
}

export function AudioPlayerPaywall({ audioUrl, allowDownload, isPremium }: AudioPlayerPaywallProps) {
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();

  // Mocking premium status check: For now, if the item is premium, 
  // we require the user to be logged in. (Replace with actual premium flag later)
  const isUserPremium = !!user; 

  const showPaywall = isPremium && !isUserPremium;

  return (
    <div className="relative bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-center min-h-[80px]">
      {showPaywall ? (
        <div className="absolute inset-0 z-10 flex flex-col sm:flex-row items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-4 p-4 border-t border-slate-800">
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

      <div className={cn("w-full transition-all duration-300", showPaywall && "opacity-20 pointer-events-none select-none blur-[2px]")}>
        <audio 
          controls 
          controlsList={allowDownload ? "" : "nodownload"}
          className="w-full h-12 [&::-webkit-media-controls-panel]:bg-slate-100" 
          src={showPaywall ? "" : audioUrl} // Do not even load the URL if locked
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
}
