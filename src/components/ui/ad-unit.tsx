'use client';

import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  publisherId?: string;
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
  show?: boolean;
  style?: React.CSSProperties;
}

export function AdUnit({ publisherId, slotId, format = 'auto', className = '', show = true, style }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!show || !publisherId || !slotId || loaded.current) return;
    
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      loaded.current = true;
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [show, publisherId, slotId]);

  if (!show) return null;

  // Fallback realistic placeholder if IDs are missing (useful for demo/development)
  if (!publisherId || !slotId) {
    return (
      <div className={`relative bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden rounded-xl ${className}`} style={style}>
        {/* Fake AdChoices Icon */}
        <div className="absolute top-0 right-0 bg-white/80 dark:bg-black/50 text-[9px] px-1.5 py-0.5 text-slate-500 rounded-bl-sm flex items-center gap-1 z-10 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 block" /> AdChoices
        </div>
        <div className="text-center p-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 block mb-1">Advertisement</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">Support us by viewing ads</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%', ...style }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
