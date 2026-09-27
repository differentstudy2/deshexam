'use client';

import React from 'react';

interface CustomVideoPlayerProps {
  url: string;
  thumbnail?: string;
  title?: string;
}

export function CustomVideoPlayer({ url, title }: CustomVideoPlayerProps) {
  // Convert regular youtube watch URL to embed URL
  let embedUrl = url;
  if (url.includes('youtube.com/watch?v=')) {
    embedUrl = url.replace('watch?v=', 'embed/');
    // Remove any extra query params and add our own
    embedUrl = embedUrl.split('&')[0];
    embedUrl += '?rel=0&modestbranding=1';
  } else if (url.includes('youtu.be/')) {
    embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/');
    embedUrl += '?rel=0&modestbranding=1';
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 shadow-sm group">
      <iframe 
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        // The sandbox attribute without allow-popups or allow-top-navigation 
        // prevents YouTube links from opening in new tabs or redirecting the page!
        sandbox="allow-scripts allow-same-origin allow-presentation"
      ></iframe>
      
      {/* 
        Invisible overlay over the top header of the YouTube iframe.
        This physically blocks the mouse from clicking the video title or creator avatar.
      */}
      <div 
        className="absolute top-0 left-0 w-full h-[60px] z-10 cursor-default" 
        title={title || 'Video'}
      ></div>
    </div>
  );
}
