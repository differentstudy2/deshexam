'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Send, Sparkles, BookOpen, FileQuestion, PenTool, Bookmark, ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Chapter, Topic, Exam } from '@/lib/types';

interface LessonToolsPanelProps {
  progress?: number;
  sectionsFinished?: number;
  totalSections?: number;
  textbookId: string;
  chapterId: string;
  topicId?: string;
}

export function LessonToolsPanel({ 
  progress = 0, 
  sectionsFinished = 0, 
  totalSections = 0,
  textbookId,
  chapterId,
  topicId
}: LessonToolsPanelProps) {
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    setSavingNote(true);
    // Debounce save logic here...
    setTimeout(() => setSavingNote(false), 1000);
  };

  const { user, logOut } = useAuth();

  return (
    <div className="space-y-6">
      {/* User Profile Widget */}
      <div className="flex items-center justify-between p-3 w-full rounded-xl bg-card border shadow-sm">
         <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                 <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                 <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
             </Avatar>
             <div className="flex flex-col overflow-hidden">
                 <span className="text-sm font-bold text-slate-800 leading-tight truncate">{user?.displayName || "Jonas Koptel"}</span>
                 <span className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate">{user?.email || "jonas@example.com"}</span>
             </div>
         </div>
         <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={logOut}>
             <LogOut className="h-4 w-4"/>
         </Button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold mb-2">Quick Actions</h4>
        <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <Sparkles className="w-4 h-4 mr-2 text-primary" /> Ask AI Doubt
        </Button>
        <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <FileQuestion className="w-4 h-4 mr-2" /> Generate MCQ Practice
        </Button>
        <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <PenTool className="w-4 h-4 mr-2" /> Generate CQ Practice
        </Button>
        <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <PlayCircleIcon className="w-4 h-4 mr-2" /> Practice Now
        </Button>
        <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <Bookmark className="w-4 h-4 mr-2" /> Add Bookmark
        </Button>
        <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <FileDownIcon className="w-4 h-4 mr-2" /> Download PDF
        </Button>
      </div>

      {/* AI Doubt Assistant */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">AI Doubt Assistant</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="relative">
            <Input placeholder="Ask anything about this lesson..." className="pr-10 text-sm" />
            <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes Widget */}
      <Card>
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Notes Widget</CardTitle>
          {savingNote ? (
             <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>
          ) : (
             <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2Icon className="w-3 h-3"/> Autosave</span>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Textarea 
            placeholder="Start typing your notes here..." 
            className="min-h-[120px] text-sm resize-none"
            value={note}
            onChange={handleNoteChange}
          />
        </CardContent>
      </Card>

      {/* Related Content */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Related Content</h4>
        <Accordion type="single" collapsible className="w-full text-sm">
          <AccordionItem value="prev-chapter">
            <AccordionTrigger className="py-2 hover:no-underline">Previous Chapter</AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 border-l space-y-2 text-muted-foreground">
                <p>Unit 2: The Greatest Scientific Achievements</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="next-lesson">
            <AccordionTrigger className="py-2 hover:no-underline">Next Lesson</AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 border-l space-y-2 text-muted-foreground">
                <p>Lesson 2: Dream Poems</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="similar">
            <AccordionTrigger className="py-2 hover:no-underline">Similar Lessons</AccordionTrigger>
            <AccordionContent>
               <div className="pl-4 border-l space-y-2 text-muted-foreground">
                <p>More about Dreams in Literature</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="mock-tests">
            <AccordionTrigger className="py-2 hover:no-underline">Mock Tests</AccordionTrigger>
            <AccordionContent>
               <div className="pl-4 border-l space-y-2 text-muted-foreground">
                <p>Unit 3 Comprehensive Test</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

    </div>
  );
}

function PlayCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function CheckCircle2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function FileDownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M12 18v-6" />
      <path d="m9 15 3 3 3-3" />
    </svg>
  )
}
