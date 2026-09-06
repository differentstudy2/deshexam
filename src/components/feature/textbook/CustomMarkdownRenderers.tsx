'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Lightbulb, Volume2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const CustomMarkdownRenderers = {
  // Style blockquotes as important notes
  blockquote: ({ node, ...props }: any) => {
    return (
      <blockquote className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md my-4 flex gap-3 text-sm" {...props}>
        <div className="shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5 text-yellow-500" fill="currentColor" />
        </div>
        <div className="text-yellow-900 font-medium leading-relaxed">
          {props.children}
        </div>
      </blockquote>
    );
  },
  // Custom table styling (Vocabulary style)
  table: ({ node, ...props }: any) => (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm text-left" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="text-xs uppercase bg-muted text-muted-foreground" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th className="px-4 py-3 font-semibold border-b" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="px-4 py-3 border-b border-border/50" {...props} />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="bg-card hover:bg-muted/50 transition-colors" {...props} />
  ),
  // Custom reading passage blocks (could be triggered by specific heading or structure)
  // For standard markdown, we just style p nicely
  p: ({ node, ...props }: any) => (
    <p className="leading-relaxed text-foreground/90 my-4 text-base md:text-[1.1rem]" style={{ lineHeight: '1.8' }} {...props} />
  ),
  h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mt-8 mb-4" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mt-8 mb-4 text-primary" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold mt-6 mb-3" {...props} />,
};

export function ReadingPassageBlock({ content, translation }: { content: string, translation?: string }) {
  const [showTranslation, setShowTranslation] = React.useState(false);

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="text-lg font-bold">Reading Passage</h3>
        {translation && (
          <div className="flex items-center space-x-2 text-sm">
            <Label htmlFor="translation-mode" className="text-muted-foreground">View Translation</Label>
            <Switch 
              id="translation-mode" 
              checked={showTranslation} 
              onCheckedChange={setShowTranslation} 
            />
            <span className={cn("text-xs font-medium", showTranslation ? "text-primary" : "text-muted-foreground")}>
              {showTranslation ? 'Bengali' : 'English'}
            </span>
          </div>
        )}
      </div>
      <div className="prose dark:prose-invert max-w-none p-4 rounded-lg bg-card border shadow-sm text-base md:text-[1.1rem] leading-[1.8]">
        {showTranslation && translation ? translation : content}
      </div>
    </div>
  );
}
