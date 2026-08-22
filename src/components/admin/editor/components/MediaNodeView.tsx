import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { AlignLeft, AlignCenter, AlignRight, FileText } from 'lucide-react';

export default function MediaNodeView(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props;
  const { src, type, caption, width, align } = node.attrs;
  
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Sync prop width to state when not resizing
  useEffect(() => {
    if (!isResizing) {
      setCurrentWidth(width);
    }
  }, [width, isResizing]);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startX.current = e.pageX;
    if (containerRef.current) {
      startWidth.current = containerRef.current.offsetWidth;
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: globalThis.MouseEvent) => {
      const delta = e.pageX - startX.current;
      const newWidth = Math.max(100, startWidth.current + delta);
      setCurrentWidth(`${newWidth}px`);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      updateAttributes({ width: currentWidth });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, currentWidth, updateAttributes]);

  const getAlignClass = () => {
    switch (align) {
      case 'left': return 'mr-auto';
      case 'right': return 'ml-auto';
      case 'center': default: return 'mx-auto';
    }
  };

  const renderMedia = () => {
    const style = { width: currentWidth, maxWidth: '100%' };
    switch (type) {
      case 'image':
        return <img src={src} style={style} className="block rounded-md object-contain max-h-[800px]" alt={caption || 'Image'} />;
      case 'video':
        return <video src={src} style={style} controls className="block rounded-md bg-black" />;
      case 'youtube':
        // ensure correct embed url
        const embedSrc = src.includes('watch?v=') ? src.replace('watch?v=', 'embed/') : src;
        return (
          <div style={style} className="relative aspect-video rounded-md overflow-hidden bg-black">
            <iframe src={embedSrc} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen />
          </div>
        );
      case 'audio':
        return <audio src={src} style={style} controls className="block w-full max-w-[400px]" />;
      case 'pdf':
        return (
          <div style={style} className="relative aspect-[1/1.4] rounded-md overflow-hidden border border-slate-200">
            <iframe src={src} className="absolute inset-0 w-full h-full" />
            <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
              <FileText className="w-3 h-3" /> PDF
            </div>
          </div>
        );
      default:
        return <div className="p-4 bg-red-50 text-red-500 rounded">Unknown media type</div>;
    }
  };

  return (
    <NodeViewWrapper className={`media-node my-6 clear-both relative group ${selected ? 'is-selected' : ''}`}>
      <div className={`relative flex flex-col ${getAlignClass()}`} style={{ width: type === 'audio' ? 'auto' : currentWidth, maxWidth: '100%' }}>
        
        {/* Alignment Toolbar (only shows when selected) */}
        {selected && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border shadow-md rounded-md p-1 flex gap-1 z-10">
            <button onClick={() => updateAttributes({ align: 'left' })} className={`p-1 rounded ${align === 'left' ? 'bg-slate-100 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}><AlignLeft className="w-4 h-4" /></button>
            <button onClick={() => updateAttributes({ align: 'center' })} className={`p-1 rounded ${align === 'center' ? 'bg-slate-100 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}><AlignCenter className="w-4 h-4" /></button>
            <button onClick={() => updateAttributes({ align: 'right' })} className={`p-1 rounded ${align === 'right' ? 'bg-slate-100 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}><AlignRight className="w-4 h-4" /></button>
          </div>
        )}

        <div ref={containerRef} className={`relative inline-block ${selected ? 'ring-2 ring-emerald-500 rounded-md' : ''}`}>
          {renderMedia()}

          {/* Resize Handle */}
          {selected && type !== 'audio' && (
            <div 
              className="absolute -right-2 -bottom-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full cursor-se-resize z-20 shadow-sm"
              onMouseDown={onMouseDown}
            />
          )}
        </div>

        {/* Caption */}
        <input
          className={`mt-2 text-sm text-center text-slate-500 bg-transparent border-none outline-none focus:ring-1 focus:ring-slate-200 rounded px-2 py-1 w-full placeholder:text-slate-300 ${!selected && !caption ? 'hidden' : 'block'}`}
          placeholder="Write a caption..."
          value={caption}
          onChange={e => updateAttributes({ caption: e.target.value })}
        />
      </div>
    </NodeViewWrapper>
  );
}
