'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';
import { 
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, 
  Heading1, Heading2, Heading3, Heading4,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote, Code,
  Highlighter, ImageIcon, YoutubeIcon, Table as TableIcon,
  Undo, Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      (editor.chain().focus() as any).setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt('Enter YouTube URL:');
    if (url) {
      (editor.chain().focus() as any).setYoutubeVideo({ src: url }).run();
    }
  };

  const insertTable = () => {
    (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/20 sticky top-0 z-10 rounded-t-md items-center">
      <Button size="sm" variant="ghost" className={editor.isActive('bold') ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleBold().run()}>
        <Bold className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive('italic') ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleItalic().run()}>
        <Italic className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive('underline') ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleUnderline().run()}>
        <UnderlineIcon className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive('strike') ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleStrike().run()}>
        <Strikethrough className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive('highlight') ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleHighlight().run()}>
        <Highlighter className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button size="sm" variant="ghost" className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleHeading({ level: 1 }).run()}>
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleHeading({ level: 2 }).run()}>
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleHeading({ level: 3 }).run()}>
        <Heading3 className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button size="sm" variant="ghost" className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).setTextAlign('left').run()}>
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).setTextAlign('center').run()}>
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).setTextAlign('right').run()}>
        <AlignRight className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button size="sm" variant="ghost" className={editor.isActive('bulletList') ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleBulletList().run()}>
        <List className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive('orderedList') ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleOrderedList().run()}>
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive('taskList') ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleTaskList().run()}>
        <CheckSquare className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button size="sm" variant="ghost" className={editor.isActive('blockquote') ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleBlockquote().run()}>
        <Quote className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className={editor.isActive('codeBlock') ? 'bg-muted' : ''} onClick={() => (editor.chain().focus() as any).toggleCodeBlock().run()}>
        <Code className="w-4 h-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <Button size="sm" variant="ghost" onClick={addImage}>
        <ImageIcon className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={addYoutube}>
        <YoutubeIcon className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={insertTable}>
        <TableIcon className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button size="sm" variant="ghost" onClick={() => (editor.chain().focus() as any).undo().run()} disabled={!editor.can().undo()}>
        <Undo className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => (editor.chain().focus() as any).redo().run()} disabled={!editor.can().redo()}>
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  );
};

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Image,
      Youtube,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Markdown,
    ] as any[],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[400px] w-full px-8 py-6',
      },
    },
    onUpdate: ({ editor }) => {
      // Export as markdown, or HTML depending on need.
      // We will export HTML since it's a CMS
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border rounded-lg shadow-sm bg-white dark:bg-slate-950 overflow-hidden flex flex-col w-full min-h-[400px]">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="w-full flex-grow cursor-text" />
    </div>
  );
}
