'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Bookmark, AlertTriangle, Trophy, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserBookmarks, getUserMistakes, getUserRecentScores } from '@/lib/firebase/student-analytics';
import { useRouter } from 'next/navigation';

export default function StudentDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [recentScores, setRecentScores] = useState<any[]>([]);
    const [bookmarksCount, setBookmarksCount] = useState(0);
    const [mistakesCount, setMistakesCount] = useState(0);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            // Load stats
            getUserRecentScores(user.uid).then(setRecentScores);
            getUserBookmarks(user.uid).then(b => setBookmarksCount(b.length));
            getUserMistakes(user.uid).then(m => setMistakesCount(m.length));
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) return <div className="p-12 text-center text-slate-500">Loading Dashboard...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
                <p className="text-slate-500 mt-2">Welcome back! Here is your study progress and customized practice plan.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-blue-700 flex items-center text-lg"><Trophy className="mr-2 h-5 w-5" /> Recent Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-900">
                            {recentScores.length > 0 ? `${Math.round(recentScores[0].scorePercentage)}%` : 'N/A'}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">On last practice set</p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50/50 border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-700 flex items-center text-lg"><Clock className="mr-2 h-5 w-5" /> Practice Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-emerald-900">12h</p>
                        <p className="text-sm text-emerald-600 mt-1">This week</p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50/50 border-amber-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-amber-700 flex items-center text-lg"><Bookmark className="mr-2 h-5 w-5" /> Saved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-amber-900">{bookmarksCount}</p>
                        <p className="text-sm text-amber-600 mt-1">Bookmarked Questions</p>
                    </CardContent>
                </Card>
                <Card className="bg-rose-50/50 border-rose-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-rose-700 flex items-center text-lg"><AlertTriangle className="mr-2 h-5 w-5" /> Mistakes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-rose-900">{mistakesCount}</p>
                        <p className="text-sm text-rose-600 mt-1">In Mistake Vault</p>
                    </CardContent>
                </Card>
            </div>

            {/* Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="bookmarks">Bookmarks Vault</TabsTrigger>
                    <TabsTrigger value="mistakes">Mistake Vault</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommended Practice</CardTitle>
                                <CardDescription>Based on your recent mistakes</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 border rounded-lg hover:border-[#00a651] transition-colors flex justify-between items-center bg-slate-50">
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Physics: Newton's Laws</h4>
                                        <p className="text-sm text-slate-500">10 questions • 15 mins</p>
                                    </div>
                                    <Button className="bg-[#00a651] hover:bg-[#009045] rounded-full px-6">Start <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                </div>
                                <div className="p-4 border rounded-lg hover:border-[#00a651] transition-colors flex justify-between items-center bg-slate-50">
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Chemistry: Organic Compounds</h4>
                                        <p className="text-sm text-slate-500">20 questions • 30 mins</p>
                                    </div>
                                    <Button className="bg-[#00a651] hover:bg-[#009045] rounded-full px-6">Start <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Quiz History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentScores.length === 0 ? (
                                    <p className="text-slate-500 py-4 text-center">No recent quizzes taken.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {recentScores.map((score, i) => (
                                            <div key={i} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium">{score.taxonomyId || 'General Quiz'}</p>
                                                    <p className="text-xs text-slate-400">{new Date(score.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-slate-800">{score.correctAnswers}/{score.totalQuestions}</p>
                                                    <p className="text-xs text-green-600 font-semibold">{Math.round(score.scorePercentage)}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="bookmarks">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bookmarked Questions</CardTitle>
                            <CardDescription>Questions you saved for later revision.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 py-12 text-center border-2 border-dashed rounded-lg">
                                Your bookmarked questions will appear here. Click the bookmark icon on any question to save it.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="mistakes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mistake Vault</CardTitle>
                            <CardDescription>Questions you got wrong in Practice Mode. Review these to improve your score.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 py-12 text-center border-2 border-dashed rounded-lg">
                                Your Mistake Vault is currently empty! Keep practicing.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
