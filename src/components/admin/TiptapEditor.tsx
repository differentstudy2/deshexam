'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

import { 
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Code, Image as ImageIcon, Video, Table as TableIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-t-md">
      <Toggle 
        size="sm" 
        pressed={editor.isActive('bold')} 
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle 
        size="sm" 
        pressed={editor.isActive('italic')} 
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle 
        size="sm" 
        pressed={editor.isActive('underline')} 
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      
      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 my-auto" />

      <Toggle 
        size="sm" 
        pressed={editor.isActive('heading', { level: 1 })} 
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle 
        size="sm" 
        pressed={editor.isActive('heading', { level: 2 })} 
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle 
        size="sm" 
        pressed={editor.isActive('heading', { level: 3 })} 
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>

      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 my-auto" />

      <Toggle 
        size="sm" 
        pressed={editor.isActive('bulletList')} 
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle 
        size="sm" 
        pressed={editor.isActive('orderedList')} 
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle 
        size="sm" 
        pressed={editor.isActive('blockquote')} 
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Toggle>
      <Toggle 
        size="sm" 
        pressed={editor.isActive('codeBlock')} 
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="h-4 w-4" />
      </Toggle>

      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 my-auto" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt('Image URL');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt('YouTube URL');
          if (url) {
            editor.commands.setYoutubeVideo({ src: url });
          }
        }}
      >
        <Video className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: true, allowBase64: true }),
      Youtube,
      TextStyle,
      Color,
      Highlight
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
      },
    },
  });

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-white dark:bg-slate-950">
      <MenuBar editor={editor} />
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
