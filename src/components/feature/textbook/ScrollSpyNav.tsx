'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface ScrollSpyNavProps {
  headings: Heading[];
  activeHeadingId: string | null;
  onHeadingClick: (id: string) => void;
}

export function ScrollSpyNav({ headings, activeHeadingId, onHeadingClick }: ScrollSpyNavProps) {
  if (headings.length === 0) {
    return <div className="text-sm text-muted-foreground p-4">No sections found.</div>;
  }

  return (
    <nav className="space-y-1 relative before:absolute before:inset-y-0 before:left-[24px] before:w-px before:bg-border p-4 pt-0">
      {headings.map((heading, index) => {
        const isActive = activeHeadingId === heading.id;
        const isPast = activeHeadingId && headings.findIndex(h => h.id === activeHeadingId) > index;
        
        return (
          <div key={heading.id} className="relative z-10 flex items-center group">
            <button
              onClick={() => onHeadingClick(heading.id)}
              className={cn(
                "flex items-center gap-3 py-1.5 w-full text-left transition-colors text-sm",
                isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              )}
              style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
            >
              <div className={cn(
                "w-5 h-5 flex items-center justify-center rounded-full bg-background shrink-0 transition-colors",
                isActive || isPast ? "text-green-500" : "text-muted-foreground"
              )}>
                {isActive || isPast ? <CheckCircle2 className="w-4 h-4 bg-background" /> : <div className="w-2.5 h-2.5 border-2 rounded-full border-muted-foreground bg-background" />}
              </div>
              <span className="truncate">{heading.text}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
