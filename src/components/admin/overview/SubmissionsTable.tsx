'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Trash2, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScoreCircle } from '@/components/feature/score-circle';
import { Link } from '@/i18n/routing';

type Submission = {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  submittedAt: any;
  testType: string;
  userId: string;
  user?: {
    displayName: string;
    photoURL?: string;
  };
};

interface SubmissionsTableProps {
  loading: boolean;
  submissions: Submission[];
  selectedSubmissions: string[];
  onSelectSubmission: (id: string) => void;
  onDeleteSubmissions: (ids: string[]) => void;
  currentPage: number;
  hasMore: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function SubmissionsTable({
  loading,
  submissions,
  selectedSubmissions,
  onSelectSubmission,
  onDeleteSubmissions,
  currentPage,
  hasMore,
  onNextPage,
  onPrevPage
}: SubmissionsTableProps) {
  
  const getUrlForResults = (sub: Submission) => {
    if (sub.testType === 'Practice Set') {
      return `/textbook-solutions/practice-set/${sub.testId}/results?submissionId=${sub.id}`;
    }
    const typeSlug = (sub.testType || 'content').toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${sub.testId}/results?submissionId=${sub.id}`;
  };

  return (
    <Card className="border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-xl relative overflow-hidden group col-span-1 lg:col-span-3">
      
      {/* Background soft glow */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100/50 pb-5 relative z-10">
        <div>
            <CardTitle className="text-xl font-bold font-lexend text-slate-800">Recent Submissions</CardTitle>
            <CardDescription className="text-sm text-slate-500 mt-1">Latest test results and activity from users.</CardDescription>
        </div>
        <div className="mt-4 sm:mt-0 min-h-[36px]">
          {selectedSubmissions.length > 0 && (
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="shadow-sm shadow-red-500/20 rounded-full px-5 hover:scale-105 transition-transform">
                          <Trash2 className="mr-2 h-4 w-4"/>
                          Delete ({selectedSubmissions.length})
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
                      <AlertDialogHeader>
                          <AlertDialogTitle className="font-lexend text-xl">Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete {selectedSubmissions.length} submission(s). This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteSubmissions(selectedSubmissions)} className="bg-red-500 hover:bg-red-600 rounded-full shadow-lg shadow-red-500/30">Delete Permanently</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 relative z-10">
        {loading ? (
            <div className="p-6 space-y-4">
                <Skeleton className="h-16 w-full rounded-2xl bg-slate-100/50" />
                <Skeleton className="h-16 w-full rounded-2xl bg-slate-100/50" />
                <Skeleton className="h-16 w-full rounded-2xl bg-slate-100/50" />
            </div>
        ) : submissions.length > 0 ? (
            <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 w-10"></th>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Assessment</th>
                            <th className="px-6 py-4 text-center">Score</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {submissions.map((sub, idx) => (
                            <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <Checkbox 
                                        checked={selectedSubmissions.includes(sub.id)}
                                        onCheckedChange={() => onSelectSubmission(sub.id)}
                                        className="border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
                                            <AvatarImage src={sub.user?.photoURL} />
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-blue-100 text-blue-700 font-semibold text-xs">
                                              {sub.user?.displayName?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-semibold text-slate-900 leading-tight">{sub.user?.displayName || 'Unknown'}</div>
                                          <div className="text-xs text-slate-400 mt-0.5">
                                            {sub.submittedAt 
                                              ? (typeof sub.submittedAt.toDate === 'function' 
                                                  ? sub.submittedAt.toDate().toLocaleDateString() 
                                                  : new Date(sub.submittedAt).toLocaleDateString())
                                              : 'Unknown Date'}
                                          </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-slate-700">{sub.testTitle}</div>
                                  <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">{sub.testType}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center transform scale-90 group-hover:scale-100 transition-transform">
                                        <ScoreCircle score={(sub.score / sub.totalQuestions) * 100} size={40} strokeWidth={4} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                            <Link href={getUrlForResults(sub)}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="font-lexend text-xl">Delete Submission?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete this submission record. It cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDeleteSubmissions([sub.id])} className="bg-red-500 hover:bg-red-600 rounded-full shadow-lg shadow-red-500/30">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                    <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">No submissions yet</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">When users complete tests, their results will securely appear here.</p>
            </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-slate-100 bg-slate-50/30 rounded-b-[24px] py-4 px-6 relative z-10">
          <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-slate-500">
                  Page {currentPage}
              </span>
              <div className="flex items-center space-x-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={onPrevPage}
                      disabled={currentPage === 1 || loading}
                      className="h-9 rounded-full px-4 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 shadow-sm"
                  >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={onNextPage}
                      disabled={!hasMore || loading}
                      className="h-9 rounded-full px-4 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 shadow-sm"
                  >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
              </div>
          </div>
      </CardFooter>
    </Card>
  );
}
