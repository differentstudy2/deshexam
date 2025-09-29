
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { Resource } from '@/lib/types';

type ResourceViewerDialogProps = {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ResourceViewerDialog({ resource, open, onOpenChange }: ResourceViewerDialogProps) {
  if (!resource) return null;

  const renderContent = () => {
    switch (resource.type) {
      case 'video':
        return (
          <video controls autoPlay className="w-full rounded-md">
            <source src={resource.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <audio controls autoPlay className="w-full">
            <source src={resource.url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        );
      case 'pdf':
        return (
          <div className="w-full h-[70vh] flex flex-col">
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(resource.url)}&embedded=true`}
              className="w-full h-full border-0"
              title={resource.title}
            ></iframe>
             <Button asChild variant="link" className="mt-2">
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </a>
            </Button>
          </div>
        );
      case 'doc':
      default:
        return (
          <div className="text-center p-8">
            <p className="mb-4">This document type cannot be previewed directly.</p>
            <Button asChild>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Document in New Tab
              </a>
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{resource.title}</DialogTitle>
          <DialogDescription>
            Resource type: {resource.type.toUpperCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-auto">
            {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
