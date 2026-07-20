'use client';
import React, { useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { marked } from 'marked';

// Our Custom Educational Extensions
import { MathExtension } from './editor/extensions/MathExtension';
import { CalloutExtension } from './editor/extensions/CalloutExtension';
import { AssessmentExtension } from './editor/extensions/AssessmentExtension';
import { MediaExtension } from './editor/extensions/MediaExtension';
import { SlashCommand, renderItems } from './editor/extensions/SlashCommand';

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, CheckSquare, Quote, Code, Image as ImageIcon, Video, FileText, Music, Table as TableIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Info, Sigma, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, UploadCloud, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Implement the suggestion items for SlashCommands
const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: Heading1,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: Heading2,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bulleted list.',
      icon: List,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Checklist',
      description: 'Track tasks with a to-do list.',
      icon: CheckSquare,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Table',
      description: 'Insert an editable table.',
      icon: TableIcon,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      },
    },
    {
      title: 'Math Equation',
      description: 'Insert LaTeX math (e.g. fractions, algebra).',
      icon: Sigma,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setMath().run();
      },
    },
    {
      title: 'Callout (Info)',
      description: 'Insert an informational callout box.',
      icon: Info,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCallout({ type: 'info' }).run();
      },
    },
    {
      title: 'Multiple Choice (MCQ)',
      description: 'Insert a multiple choice question block.',
      icon: HelpCircle,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setAssessment({ type: 'mcq' }).run();
      },
    },
    {
      title: 'Image',
      description: 'Upload an image or embed a link.',
      icon: ImageIcon,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setMedia({ type: 'image' }).run(); // Note: they'd need to set src later
      },
    },
    {
      title: 'YouTube Video',
      description: 'Embed a YouTube video.',
      icon: Video,
      command: ({ editor, range }: any) => {
        const url = window.prompt('YouTube URL:');
        if (url) {
          editor.chain().focus().deleteRange(range).setMedia({ src: url, type: 'youtube' }).run();
        } else {
          editor.chain().focus().deleteRange(range).run();
        }
      },
    },
  ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
};


const MenuBar = ({ editor, children }: { editor: any, children?: React.ReactNode }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = React.useState(false);
  const [mediaUrlInput, setMediaUrlInput] = React.useState('');
  const [mediaType, setMediaType] = React.useState<'image' | 'video' | 'audio' | 'pdf' | 'youtube'>('image');
  const { toast } = useToast();

  if (!editor) {
    return null;
  }

  const handleAddMediaUrl = () => {
    if (mediaUrlInput.trim()) {
      editor.chain().focus().setMedia({ src: mediaUrlInput.trim(), type: mediaType }).run();
      setMediaUrlInput('');
      setMediaDialogOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `editor-media/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      let type: 'image' | 'video' | 'audio' | 'pdf' = 'image';
      if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type === 'application/pdf') type = 'pdf';

      editor.chain().focus().setMedia({ src: url, type }).run();
      setMediaDialogOpen(false);
      toast({ title: "Upload Success", description: "Your file was successfully uploaded." });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({ title: "Upload Failed", description: "Failed to upload file.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getActiveHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('heading', { level: 4 })) return 'h4';
    return 'p';
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-[#f8faf8] dark:bg-slate-900 sticky top-0 z-40 items-center">
      {/* Headings Dropdown */}
      <select
        value={getActiveHeading()}
        onChange={(e) => {
          const val = e.target.value;
          if (val === 'p') editor.chain().focus().setParagraph().run();
          else if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
          else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
          else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
          else if (val === 'h4') editor.chain().focus().toggleHeading({ level: 4 }).run();
        }}
        className="text-xs h-7 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-2 font-medium text-slate-600 dark:text-slate-300 focus:ring-0 focus:outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <option value="p">Normal text</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
      </select>

      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 my-auto" />

      {/* Formatting */}
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('highlight')} onPressedChange={() => editor.chain().focus().toggleHighlight().run()}>
        <Type className="h-4 w-4 text-yellow-500" />
      </Toggle>

      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 my-auto" />

      {/* Alignment */}
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}>
        <AlignJustify className="h-4 w-4" />
      </Toggle>

      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 my-auto" />

      {/* Lists & Blocks */}
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('taskList')} onPressedChange={() => editor.chain().focus().toggleTaskList().run()}>
        <CheckSquare className="h-4 w-4" />
      </Toggle>

      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 my-auto" />

      {/* Advanced Blocks */}
      <Button variant="ghost" size="sm" title="Add Math" onClick={() => editor.chain().focus().setMath().run()}>
        <Sigma className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Add Callout" onClick={() => editor.chain().focus().setCallout().run()}>
        <Info className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Add Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <TableIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 my-auto" />

      {/* Media Dialog */}
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Add Media">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Media (Image, Video, Audio, PDF)</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Upload from computer</label>
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline" className="w-full">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*,audio/*,application/pdf"
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
              <label className="text-sm font-medium">Embed URL</label>
              <select
                className="text-sm border border-slate-200 dark:border-slate-800 rounded p-2 bg-transparent"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as any)}
              >
                <option value="image">Image URL</option>
                <option value="video">Video URL (.mp4)</option>
                <option value="audio">Audio URL (.mp3)</option>
                <option value="pdf">PDF URL</option>
                <option value="youtube">YouTube URL</option>
              </select>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="https://..."
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddMediaUrl(); }}
                />
                <Button onClick={handleAddMediaUrl} disabled={!mediaUrlInput.trim()}>Add</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex-1 min-w-[1rem]" />
      {children}
    </div>
  );
};

export function TiptapEditor({ content, onChange, maxHeight }: { content: string, onChange: (html: string) => void, maxHeight?: string }) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = React.useState<'visual' | 'html' | 'markdown' | 'text'>('visual');
  const [rawContent, setRawContent] = React.useState(content);
  const [aiDialogOpen, setAiDialogOpen] = React.useState(false);
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [aiFile, setAiFile] = React.useState<File | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDrop = useCallback(
    (view: any, event: any, slice: any, moved: boolean) => {
      if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
        event.preventDefault();
        const file = event.dataTransfer.files[0];

        const uploadFile = async () => {
          try {
            const storageRef = ref(storage, `editor-media/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            let type: 'image' | 'video' | 'audio' | 'pdf' = 'image';
            if (file.type.startsWith('video/')) type = 'video';
            else if (file.type.startsWith('audio/')) type = 'audio';
            else if (file.type === 'application/pdf') type = 'pdf';

            // Insert media at current selection/drop point
            const { schema } = view.state;
            const node = schema.nodes.media.create({ src: url, type });
            const tr = view.state.tr.replaceSelectionWith(node);
            view.dispatch(tr);

            toast({ title: "Upload Success", description: "Dropped file was uploaded." });
          } catch (error) {
            console.error("Drop upload failed", error);
            toast({ title: "Upload Failed", description: "Failed to upload dropped file.", variant: "destructive" });
          }
        };

        uploadFile();
        return true; // Handled
      }
      return false; // Let tiptap handle it
    },
    [toast]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }
      }) as any,
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Underline,
      Strike,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight,
      MathExtension,
      CalloutExtension,
      AssessmentExtension,
      MediaExtension,
      SlashCommand.configure({
        suggestion: {
          items: getSuggestionItems,
          render: renderItems,
        }
      }),
      Placeholder.configure({
        placeholder: 'Start typing here... or type / for commands',
        emptyEditorClass: 'is-editor-empty',
      })
    ],
    content: content,
    editorProps: {
      handleDrop,
      attributes: {
        class: 'prose prose-sm dark:prose-invert sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[400px] pb-32 max-w-none bg-white dark:bg-[#0f1117] border border-slate-300 dark:border-slate-700 p-6 sm:p-8 rounded-xl shadow-sm mt-2 mb-8',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      previousContentRef.current = html;
      onChange(html);
      if (viewMode !== 'visual') {
        if (viewMode === 'html') setRawContent(html);
        if (viewMode === 'text') setRawContent(editor.getText());
        if (viewMode === 'markdown') setRawContent((editor.storage as any).markdown.getMarkdown());
      }
    },
  });

  const previousContentRef = React.useRef(content);

  React.useEffect(() => {
    if (!editor) return;

    // Skip if the incoming content matches what we just sent out (internal update)
    if (content === previousContentRef.current) {
      return;
    }

    if (content !== editor.getHTML()) {
      let cleanContent = content || '';
      let parsedHTML = cleanContent;

      if (cleanContent.startsWith('<p>') && cleanContent.endsWith('</p>')) {
        cleanContent = cleanContent.replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<br\s*\/?>/gi, '\n');
      }
      cleanContent = cleanContent.replace(/\\\*/g, '*');

      const hasMarkdown = /(^|\n)(#{1,6}|\*|-|>|\d+\.) /.test(cleanContent) || /\*\*(.*?)\*\*/.test(cleanContent);

      if (hasMarkdown && !/<(div|span|table|ul|ol|h[1-6])/.test(cleanContent)) {
        try {
          parsedHTML = marked.parse(cleanContent.trim()) as string;
        } catch (e) {
          console.error("Failed to parse markdown with marked", e);
        }
      }

      if (viewMode === 'visual') {
        setTimeout(() => {
          if (!editor.isDestroyed) {
            editor.commands.setContent(parsedHTML);
          }
        }, 0);
      }
    }

    previousContentRef.current = content;
  }, [content, editor, viewMode]);

  // Sync back raw content changes
  const handleRawContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawContent(e.target.value);
    onChange(e.target.value);
    if (editor) {
      if (viewMode === 'markdown') {
        editor.commands.setContent(marked.parse(e.target.value) as string);
      } else {
        editor.commands.setContent(e.target.value);
      }
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim() && !aiFile) return;
    setIsGenerating(true);
    try {
      let response;
      if (aiFile) {
        toast({ title: 'Uploading file...', description: 'Please wait while the file is being uploaded to the server.' });
        const storageRef = ref(storage, `ai-uploads/${Date.now()}_${aiFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
        const snapshot = await uploadBytes(storageRef, aiFile);
        const url = await getDownloadURL(snapshot.ref);

        response = await fetch('/api/ai/generate-from-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl: url,
            mimeType: aiFile.type,
            prompt: `Generate the following content using rich HTML tags (e.g. <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>, etc.) to make it look highly professional and well-formatted in a Rich Text Editor. DO NOT wrap the output in markdown code blocks like \`\`\`html. Output raw HTML only.\n\nUser Request: ${aiPrompt || 'Extract the content from the provided file and format it appropriately.'}`
          }),
        });
      } else {
        response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Generate the following content using rich HTML tags (e.g. <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>, etc.) to make it look highly professional and well-formatted in a Rich Text Editor. DO NOT wrap the output in markdown code blocks like \`\`\`html. Output raw HTML only.\n\nUser Request: ${aiPrompt}`
          }),
        });
      }

      if (!response.ok) throw new Error('AI Generation failed');
      const data = await response.json();

      let resultText = data.result || '';
      // Strip markdown code block wrappers if the AI ignored instructions
      if (resultText.trim().startsWith('```')) {
        resultText = resultText.trim().replace(/^```(html|markdown|json)?\n/i, '').replace(/\n```$/i, '');
      }

      if (editor) {
        editor.commands.insertContent(resultText);
      }
      setAiDialogOpen(false);
      setAiPrompt('');
      setAiFile(null);
      toast({ title: 'AI Content Generated', description: 'Content successfully inserted.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Generation Error', description: String(error) });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-100/50 dark:bg-slate-950 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-colors shadow-sm flex flex-col">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800">
        <MenuBar editor={editor}>
          <div className="flex items-center gap-1 sm:gap-2">
            <Dialog open={aiDialogOpen} onOpenChange={(open) => {
              setAiDialogOpen(open);
              if (!open) {
                setAiPrompt('');
                setAiFile(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700" title="AI Generate">
                  <Sparkles className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Content with AI</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Source File (Optional)</Label>
                      <Input 
                        type="file" 
                        accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
                        onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-[11px] text-slate-500">Upload a PDF, image, or text file to extract content from. Max size: 100MB.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Prompt for AI</Label>
                        <select 
                          className="text-[10px] border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-600 outline-none cursor-pointer w-[140px] truncate"
                          onChange={(e) => {
                            if (e.target.value) setAiPrompt(e.target.value);
                            e.target.value = ""; // Reset select
                          }}
                        >
                          <option value="">Quick Prompts...</option>
                          <option value="Extract all text from the file and format it beautifully with headings and paragraphs.">Extract & Format Text</option>
                          <option value="Extract all questions from the document and format them properly. If they are MCQs, format them with options.">Extract Questions/MCQ</option>
                          <option value="Summarize the key points of this document into a structured bulleted list.">Summarize Key Points</option>
                          <option value="Translate the contents of this document into clear, academic Bengali.">Translate to Bengali</option>
                          <option value="Fix grammatical errors and improve the language of the provided text.">Proofread & Improve</option>
                        </select>
                      </div>
                      <Textarea
                        placeholder="e.g. Extract the text and format it with headings... or Write a 3 paragraph admission process..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={4}
                      />
                      <p className="text-[11px] text-slate-500">The AI is instructed to use rich HTML tags automatically for the best formatting.</p>
                    </div>
                  </div>
                  <Button onClick={handleGenerateAI} disabled={isGenerating || (!aiPrompt.trim() && !aiFile)} className="w-full">
                    {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

            <select
              value={viewMode}
              onChange={(e) => {
                const newMode = e.target.value as any;
                setViewMode(newMode);
                if (editor) {
                  if (newMode === 'html') setRawContent(editor.getHTML());
                  if (newMode === 'text') setRawContent(editor.getText());
                  if (newMode === 'markdown') setRawContent((editor.storage as any).markdown.getMarkdown());
                }
              }}
              className="text-xs border-none bg-transparent font-medium text-slate-600 focus:ring-0 cursor-pointer p-0 pr-1 h-8"
            >
              <option value="visual">Visual</option>
              <option value="html">HTML</option>
              <option value="markdown">Markdown</option>
              <option value="text">Plain Text</option>
            </select>
          </div>
        </MenuBar>
      </div>

      <div
        className="p-0.5 sm:p-2 overflow-y-auto scrollbar-thin relative"
        style={{ maxHeight: maxHeight || '70vh' }}
      >
        {isGenerating && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-indigo-100 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-sm font-medium text-indigo-900">AI is writing...</p>
            </div>
          </div>
        )}

        {viewMode === 'visual' ? (
          <EditorContent editor={editor} />
        ) : (
          <textarea
            value={rawContent}
            onChange={handleRawContentChange}
            className="w-full h-full min-h-[400px] bg-transparent border-none focus:outline-none focus:ring-0 font-mono text-sm text-slate-700 dark:text-slate-300 resize-y"
            placeholder={`Enter ${viewMode} content here...`}
          />
        )}
      </div>
    </div>
  );
}
