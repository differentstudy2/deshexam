'use client';
import React from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
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
import Placeholder from '@tiptap/extension-placeholder';

import { 
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Code, Image as ImageIcon, Video, Table as TableIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, UploadCloud, Link as LinkIcon } from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

import { useToast } from "@/hooks/use-toast";

const MenuBar = ({ editor }: { editor: any }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [imageUrlInput, setImageUrlInput] = React.useState('');
  const [youtubeDialogOpen, setYoutubeDialogOpen] = React.useState(false);
  const [youtubeUrlInput, setYoutubeUrlInput] = React.useState('');
  const { toast } = useToast();

  if (!editor) {
    return null;
  }

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      editor.chain().focus().setImage({ src: imageUrlInput.trim() }).run();
      setImageUrlInput('');
      setImageDialogOpen(false);
    }
  };

  const handleAddYoutube = () => {
    if (youtubeUrlInput.trim()) {
      editor.commands.setYoutubeVideo({ src: youtubeUrlInput.trim() });
      setYoutubeUrlInput('');
      setYoutubeDialogOpen(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `guide-images/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      editor.chain().focus().setImage({ src: url }).run();
      setImageDialogOpen(false);
      toast({ title: "Image Uploaded", description: "Your image was successfully uploaded." });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Upload Failed", description: "Failed to upload image.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      
      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />
      
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Add Image">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Upload from computer</label>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading} 
                variant="outline" 
                className="w-full"
              >
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">Or paste URL</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Image URL</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddImageUrl();
                  }}
                />
                <Button onClick={handleAddImageUrl} disabled={!imageUrlInput.trim()}>Add</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Add YouTube Video">
            <Video className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add YouTube Video</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">YouTube URL</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  value={youtubeUrlInput}
                  onChange={(e) => setYoutubeUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddYoutube();
                  }}
                  autoFocus
                />
                <Button onClick={handleAddYoutube} disabled={!youtubeUrlInput.trim()}>Add</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Add Table"
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
      Highlight,
      Placeholder.configure({
        placeholder: 'Start typing here...',
        emptyEditorClass: 'is-editor-empty',
      })
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px] max-h-[600px] overflow-y-auto',
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
