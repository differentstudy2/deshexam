import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Bold, Italic, List, Heading2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface RichTextEditorProps {
  content: string;
  onChange: (data: { html: string; text: string; markdown: string }) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
}

export function RichTextEditor({ content, onChange, minHeight = '150px', maxHeight }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange({
        html: editor.getHTML(),
        text: editor.getText(),
        markdown: (editor.storage as any).markdown.getMarkdown(),
      });
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base focus:outline-none p-4 w-full max-w-none`,
        style: `min-height: ${minHeight};`,
      },
    },
  });

  // Sync external content changes if editor is empty (e.g. data loaded async)
  useEffect(() => {
    if (editor && content && editor.isEmpty && content !== '<p></p>') {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden flex flex-col w-full">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        <Button 
          type="button" variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        ><Bold className="w-4 h-4" /></Button>
        <Button 
          type="button" variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        ><Italic className="w-4 h-4" /></Button>
        
        <div className="w-px h-4 bg-gray-300 mx-1" />
        
        <Button 
          type="button" variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        ><Heading2 className="w-4 h-4" /></Button>
        
        <div className="w-px h-4 bg-gray-300 mx-1" />
        
        <Button 
          type="button" variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        ><List className="w-4 h-4" /></Button>
      </div>

      {/* Editor Content */}
      <div 
        className="bg-white cursor-text w-full overflow-y-auto" 
        style={{ maxHeight }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} className="w-full" />
      </div>
    </div>
  );
}
