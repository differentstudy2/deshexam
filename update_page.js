const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/[locale]/admin/question-bank/questions/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add framer-motion import
if (!content.includes("framer-motion")) {
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';");
}

// 2. Add some Lucide icons if missing
content = content.replace("import { PlusCircle, Pencil, Trash2, Loader2, ArrowLeft, Sparkles, Eye, Play, Image as ImageIcon, Video, ShieldCheck, Upload, FileJson, Copy, CheckCircle2, Filter, Layers } from 'lucide-react';",
"import { PlusCircle, Pencil, Trash2, Loader2, ArrowLeft, Sparkles, Eye, Play, Image as ImageIcon, Video, ShieldCheck, Upload, FileJson, Copy, CheckCircle2, Filter, Layers, X, Search, CheckCircle } from 'lucide-react';");

// 3. Replace the return block
const newReturnBlock = `  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-4 md:p-6 space-y-6 md:space-y-8 pb-32"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 p-4 rounded-xl backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">Question Bank</h1>
            <p className="text-sm text-slate-500 mt-1">Manage, filter, and curate your academic and competitive questions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-white/50 backdrop-blur-sm hover:bg-slate-100 transition-all border-slate-200" title="Bulk Import JSON Format">
                        <FileJson className="h-4 w-4 text-slate-600" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Bulk Import JSON Format</DialogTitle>
                        <DialogDescription>
                            Use this exact JSON format when bulk-importing questions from the Import section.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative mt-4">
                        <div className="absolute top-2 right-2 flex gap-2">
                            <Button size="sm" variant="secondary" className="h-8" onClick={handleCopyJson}>
                                {hasCopied ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                                {hasCopied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono pt-12">
                            {JSON.stringify(demoJsonFormat, null, 2)}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>
            <Link href="/admin/question-bank/academic-questions/add">
                <Button variant="default" className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex gap-2 border-0">
                    <PlusCircle className="h-4 w-4" /> Add Academic Question
                </Button>
            </Link>
            <Link href="/admin/question-bank/exam/add">
                <Button variant="default" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md shadow-emerald-600/20 transition-all flex gap-2 border-0">
                    <PlusCircle className="h-4 w-4" /> Add Exam Question
                </Button>
            </Link>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full mb-4 bg-white/50 backdrop-blur-sm">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              <Select value={filters.boardId} onValueChange={(v) => setFilters({...filters, boardId: v})}><SelectTrigger><SelectValue placeholder="All Boards" /></SelectTrigger><SelectContent><SelectItem value="all">All Boards</SelectItem>{boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.classId} onValueChange={(v) => setFilters({...filters, classId: v})}><SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger><SelectContent><SelectItem value="all">All Classes</SelectItem>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.subjectId} onValueChange={(v) => setFilters({...filters, subjectId: v})}><SelectTrigger><SelectValue placeholder="All Subjects" /></SelectTrigger><SelectContent><SelectItem value="all">All Subjects</SelectItem>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.textbookId} onValueChange={(v) => setFilters({...filters, textbookId: v})}><SelectTrigger><SelectValue placeholder="All Textbooks" /></SelectTrigger><SelectContent><SelectItem value="all">All Textbooks</SelectItem>{textbooks.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.difficulty} onValueChange={(v) => setFilters({...filters, difficulty: v})}><SelectTrigger><SelectValue placeholder="All Difficulties" /></SelectTrigger><SelectContent><SelectItem value="all">All Difficulties</SelectItem><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem><SelectItem value="Expert">Expert</SelectItem></SelectContent></Select>
              <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}><SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Published">Published</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Archived">Archived</SelectItem></SelectContent></Select>
              <Select value={filters.isVerified} onValueChange={(v) => setFilters({...filters, isVerified: v})}><SelectTrigger><SelectValue placeholder="Verification Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Verification</SelectItem><SelectItem value="true">Verified</SelectItem><SelectItem value="false">Not Verified</SelectItem></SelectContent></Select>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters (Glassmorphism Toolbar) */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6 p-4 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <Select value={filters.boardId} onValueChange={(v) => setFilters({...filters, boardId: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Boards" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Boards</SelectItem>
                  {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.classId} onValueChange={(v) => setFilters({...filters, classId: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.subjectId} onValueChange={(v) => setFilters({...filters, subjectId: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Subjects" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.textbookId} onValueChange={(v) => setFilters({...filters, textbookId: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Textbooks" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Textbooks</SelectItem>
                  {textbooks.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.difficulty} onValueChange={(v) => setFilters({...filters, difficulty: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Difficulties" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
          </Select>
          <Select value={filters.isVerified} onValueChange={(v) => setFilters({...filters, isVerified: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="Verification Status" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Not Verified</SelectItem>
              </SelectContent>
          </Select>
      </div>

      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-md bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl overflow-hidden rounded-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            All Questions 
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs py-0.5 px-2 rounded-full font-medium">
              {questions.length} found
            </span>
          </CardTitle>
          <div className="flex gap-2 text-sm text-slate-500">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Published</span>
             <span className="flex items-center gap-1 ml-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Draft</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="hidden md:table">
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 backdrop-blur-sm z-10">
              <TableRow className="border-b-slate-200 dark:border-slate-800">
                <TableHead className="w-[50px] pl-6"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" checked={questions.length > 0 && selectedIds.length === questions.length} onChange={toggleSelectAll} /></TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Text</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Type</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Difficulty</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Verified</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="h-48 text-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-500 mx-auto" /><p className="text-sm text-slate-500 mt-2">Loading questions...</p></TableCell></TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No questions found</h3>
                      <p className="text-sm mt-1 max-w-sm">Try adjusting your filters or add a new question to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {questions.map((q, i) => (
                    <motion.tr 
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                      className={\`group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 \${selectedIds.includes(q.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}\`}
                    >
                      <TableCell className="pl-6"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all" checked={selectedIds.includes(q.id)} onChange={() => toggleSelect(q.id)} /></TableCell>
                      <TableCell className="max-w-[400px]">
                        <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{q.questionText}</div>
                        {(q.boardId || q.subjectId) && (
                           <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                             {boards.find(b => b.id === q.boardId)?.name && <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{boards.find(b => b.id === q.boardId)?.name}</span>}
                             {subjects.find(s => s.id === q.subjectId)?.name && <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{subjects.find(s => s.id === q.subjectId)?.name}</span>}
                           </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {q.questionType || (q.options?.a ? 'MCQ' : 'Subjective')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={\`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                          \${q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : ''}
                          \${q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : ''}
                          \${q.difficulty === 'Hard' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' : ''}
                          \${q.difficulty === 'Expert' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : ''}
                        \`}>
                          {q.difficulty}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={\`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border
                          \${q.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : ''}
                          \${q.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : ''}
                          \${q.status === 'Archived' ? 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' : ''}
                        \`}>
                          <span className={\`w-1.5 h-1.5 rounded-full \${q.status === 'Published' ? 'bg-emerald-500' : q.status === 'Draft' ? 'bg-amber-500' : 'bg-slate-500'}\`}></span>
                          {q.status}
                        </span>
                      </TableCell>
                      <TableCell>
                          {q.isVerified ? (
                              <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/50 w-fit" title={q.verifiedByName}>
                                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                  Verified
                              </div>
                          ) : <span className="text-xs text-slate-400 dark:text-slate-500 italic">Unverified</span>}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={\`/question/\${q.slug || q.id}\`} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30" title="View Public Page"><Eye className="h-4 w-4" /></Button>
                            </Link>
                            {q.contentType === 'academic' ? (
                                <Link href={\`/admin/question-bank/academic-questions/\${q.id}\`}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-indigo-900/30" title="Edit Academic Question"><Pencil className="h-4 w-4" /></Button>
                                </Link>
                            ) : (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-indigo-900/30" onClick={() => { setEditData(q); setView('editor'); }}><Pencil className="h-4 w-4" /></Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30" onClick={async () => {
                                await deleteQuestion(q.id);
                                fetchQuestions();
                            }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden p-4">
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-500" /></div>
            ) : questions.length === 0 ? (
                <div className="text-center p-8 text-slate-500">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No questions found.
                </div>
            ) : (
                <AnimatePresence>
                {questions.map((q, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={q.id} 
                    className={\`flex flex-col p-4 border rounded-xl gap-3 bg-white dark:bg-slate-900 shadow-sm transition-all \${selectedIds.includes(q.id) ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200 dark:border-slate-800'}\`}
                  >
                      <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                              <input type="checkbox" className="w-5 h-5 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={selectedIds.includes(q.id)} onChange={() => toggleSelect(q.id)} />
                              <div className="text-sm font-medium line-clamp-3 leading-snug">{q.questionText}</div>
                          </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-8">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-medium">{q.questionType || (q.options?.a ? 'MCQ' : 'Subjective')}</span>
                          <span className={\`px-2 py-1 rounded-md font-medium border \${q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}\`}>{q.difficulty}</span>
                          <span className={\`px-2 py-1 rounded-md font-medium border \${q.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}\`}>{q.status}</span>
                          {q.isVerified && (
                              <span className="flex items-center text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md font-medium" title={q.verifiedByName}>
                                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                              </span>
                          )}
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-1">
                          <Link href={\`/question/\${q.slug || q.id}\`} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="text-blue-500"><Eye className="h-4 w-4 mr-1" /> View</Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => { setEditData(q); setView('editor'); }}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-rose-50" onClick={async () => {
                              await deleteQuestion(q.id);
                              fetchQuestions();
                          }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                  </motion.div>
                ))}
                </AnimatePresence>
            )}
          </div>
          {hasMore && !loading && questions.length > 0 && (
              <div className="flex justify-center p-6 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" className="rounded-full px-8 shadow-sm hover:shadow transition-all" onClick={() => fetchQuestions(true)} disabled={isBulkLoading}>
                      {isBulkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Load More Questions
                  </Button>
              </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Bar */}
      <AnimatePresence>
          {selectedIds.length > 0 && (
              <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl"
              >
                  <div className="bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="bg-indigo-500/20 text-indigo-300 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border border-indigo-500/30">
                              {selectedIds.length}
                          </div>
                          <span className="text-slate-200 font-medium">Questions Selected</span>
                          <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors ml-auto sm:ml-2">
                              <X className="h-4 w-4" />
                          </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                         <Select onValueChange={handleBulkUpdateStatus}>
                            <SelectTrigger className="w-[140px] h-9 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors"><SelectValue placeholder="Change Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Published">Published</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Archived">Archived</SelectItem>
                            </SelectContent>
                         </Select>
                         
                         <Dialog open={isBulkTaxonomyOpen} onOpenChange={setIsBulkTaxonomyOpen}>
                             <DialogTrigger asChild>
                                 <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700 hover:text-blue-300" disabled={isBulkLoading}>
                                     <Layers className="h-4 w-4 mr-2" /> Taxonomy
                                 </Button>
                             </DialogTrigger>
                             {/* The Taxonomy Dialog Content remains the same as it was, but we can style the button above */}
                             <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Bulk Update Taxonomy</DialogTitle>
                                    <DialogDescription>
                                        Select the taxonomy fields you want to update for the {selectedIds.length} selected questions.
                                        Leave a field empty if you do not want to change it.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Board</label>
                                         <Select value={bulkTaxonomyData.boardId} onValueChange={(v) => setBulkTaxonomyData({
                                             ...bulkTaxonomyData, 
                                             boardId: v,
                                             classId: 'no_change', subjectId: 'no_change', textbookId: 'no_change', chapterId: 'no_change', topicId: 'no_change'
                                         })}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Class</label>
                                         <Select value={bulkTaxonomyData.classId} onValueChange={(v) => setBulkTaxonomyData({
                                             ...bulkTaxonomyData, 
                                             classId: v,
                                             subjectId: 'no_change', textbookId: 'no_change', chapterId: 'no_change', topicId: 'no_change'
                                         })}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {classes.filter(c => bulkTaxonomyData.boardId === 'no_change' || (c as any).boardId === bulkTaxonomyData.boardId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                                         <Select value={bulkTaxonomyData.subjectId} onValueChange={(v) => setBulkTaxonomyData({
                                             ...bulkTaxonomyData, 
                                             subjectId: v,
                                             textbookId: 'no_change', chapterId: 'no_change', topicId: 'no_change'
                                         })}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {subjects.filter(s => bulkTaxonomyData.classId === 'no_change' || (s as any).classId === bulkTaxonomyData.classId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Textbook</label>
                                         <Select value={bulkTaxonomyData.textbookId} onValueChange={(v) => setBulkTaxonomyData({
                                             ...bulkTaxonomyData, 
                                             textbookId: v,
                                             chapterId: 'no_change', topicId: 'no_change'
                                         })}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {textbooks.filter(t => bulkTaxonomyData.subjectId === 'no_change' || (t as any).subjectId === bulkTaxonomyData.subjectId).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Chapter</label>
                                         <Select value={bulkTaxonomyData.chapterId} onValueChange={(v) => setBulkTaxonomyData({
                                             ...bulkTaxonomyData, 
                                             chapterId: v,
                                             topicId: 'no_change'
                                         })}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {chapters.filter(c => bulkTaxonomyData.textbookId === 'no_change' || (c as any).textbookId === bulkTaxonomyData.textbookId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Topic</label>
                                         <Select value={bulkTaxonomyData.topicId} onValueChange={(v) => setBulkTaxonomyData({...bulkTaxonomyData, topicId: v})}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {topics.filter(t => bulkTaxonomyData.chapterId === 'no_change' || (t as any).chapterId === bulkTaxonomyData.chapterId).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Year</label>
                                         <Select value={bulkTaxonomyData.yearId} onValueChange={(v) => setBulkTaxonomyData({...bulkTaxonomyData, yearId: v})}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {years.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Exams</label>
                                         <Select value={bulkTaxonomyData.examIds.length > 0 ? bulkTaxonomyData.examIds[0] : "no_change"} onValueChange={(v) => setBulkTaxonomyData({...bulkTaxonomyData, examIds: v === 'no_change' ? [] : [v]})}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                 </div>
                                 <div className="flex justify-end gap-2 mt-4">
                                     <Button variant="outline" onClick={() => setIsBulkTaxonomyOpen(false)}>Cancel</Button>
                                     <Button onClick={handleBulkUpdateTaxonomy} disabled={isBulkLoading}>
                                         {isBulkLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                         Update Taxonomy
                                     </Button>
                                 </div>
                             </DialogContent>
                         </Dialog>

                         <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-indigo-400 hover:bg-slate-700 hover:text-indigo-300" onClick={() => handleBulkVerify(true)} disabled={isBulkLoading}>
                             <ShieldCheck className="h-4 w-4 mr-2" /> Verify
                         </Button>
                         <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100" onClick={() => handleBulkVerify(false)} disabled={isBulkLoading}>
                             Unverify
                         </Button>
                         <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>
                         <Button variant="destructive" size="sm" className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20" onClick={handleBulkDelete} disabled={isBulkLoading}>
                             {isBulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                             Delete
                         </Button>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
}
`;

const returnRegex = /  return \([\s\S]*\}\n/m;
content = content.replace(returnRegex, newReturnBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log("File updated successfully.");
