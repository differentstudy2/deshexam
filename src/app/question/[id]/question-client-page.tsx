

'use client';

import { useEffect, useState } from 'react';
import { getQuestionById, addComment, getComments, handleQuestionVote } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, GripVertical, CheckCircle, XCircle, Info, User, Calendar, Book, Layers, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

type Option = {
  text: string;
  explanation?: string;
};

type MatchingItem = {
    text: string;
    image?: string;
};

type MatchingOptions = {
    columnA: MatchingItem[];
    columnB: MatchingItem[];
}

type Question = {
  id: string;
  text: string;
  type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Matching';
  options?: Option[];
  matchingOptions?: MatchingOptions;
  correctAnswer: any;
  explanation?: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  createdAt: Date;
  authorName: string;
  subject?: string;
};

type Comment = {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    createdAt: Date;
}

export default function QuestionClientPage({ questionId }: { questionId: string }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!questionId) return;

    const fetchQuestionAndComments = async () => {
      try {
        setLoading(true);
        const [questionData, commentsData] = await Promise.all([
          getQuestionById(questionId),
          getComments('questions', questionId),
        ]);
        if (!questionData) {
            toast({
              variant: "destructive",
              title: 'Question not found',
            });
            router.push('/dashboard/all-questions');
            return;
        }
        setQuestion(questionData as Question);
        setComments(commentsData as Comment[]);
      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching data',
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionAndComments();
  }, [questionId, toast, router]);

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!user || !question) {
        toast({ variant: "destructive", title: "Please log in to vote." });
        return;
    }
    if (isVoting) return;

    setIsVoting(true);
    
    // Optimistic UI update
    const originalQuestion = { ...question };
    const hasLiked = question.likedBy?.includes(user.uid);
    const hasDisliked = question.dislikedBy?.includes(user.uid);

    let newLikedBy = [...(question.likedBy || [])];
    let newDislikedBy = [...(question.dislikedBy || [])];

    if (type === 'like') {
        if (hasLiked) { // User is un-liking
            newLikedBy = newLikedBy.filter(uid => uid !== user.uid);
        } else { // User is liking
            newLikedBy.push(user.uid);
            if (hasDisliked) { // If they previously disliked, remove dislike
                newDislikedBy = newDislikedBy.filter(uid => uid !== user.uid);
            }
        }
    } else if (type === 'dislike') {
        if (hasDisliked) { // User is un-disliking
            newDislikedBy = newDislikedBy.filter(uid => uid !== user.uid);
        } else { // User is disliking
            newDislikedBy.push(user.uid);
            if (hasLiked) { // If they previously liked, remove like
                newLikedBy = newLikedBy.filter(uid => uid !== user.uid);
            }
        }
    }
    
    const updatedQuestion = {
        ...question,
        likedBy: newLikedBy,
        dislikedBy: newDislikedBy,
        likes: newLikedBy.length,
        dislikes: newDislikedBy.length
    };
    setQuestion(updatedQuestion);

    try {
        await handleQuestionVote(questionId, type);
    } catch (error) {
        // Revert UI on error
        setQuestion(originalQuestion);
        toast({
          variant: "destructive",
          title: 'Error submitting vote',
          description: (error as Error).message,
        });
    } finally {
        setIsVoting(false);
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Please log in to comment." });
        return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
        await addComment('questions', questionId, { text: newComment });
        setNewComment('');
        // Refetch comments to show the new one
        const updatedComments = await getComments('questions', questionId);
        setComments(updatedComments as Comment[]);
        toast({ title: "Comment posted!" });
    } catch (error) {
         toast({
          variant: "destructive",
          title: 'Error posting comment',
          description: (error as Error).message,
        });
    } finally {
        setIsSubmittingComment(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center min-h-[calc(100vh-200px)] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Question not found</h2>
        <p className="text-muted-foreground">The question you are looking for does not exist.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline" onClick={() => router.back()}>
            <Link href="#">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
            </Link>
        </Button>
      </div>
    );
  }

  const userHasLiked = user && question.likedBy?.includes(user.uid);
  const userHasDisliked = user && question.dislikedBy?.includes(user.uid);

  return (
    <div className="bg-secondary/30">
        <div className="container py-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    {question.subject && <Badge className="mb-2">{question.subject}</Badge>}
                    <div className="prose dark:prose-invert lg:prose-xl max-w-none">
                       <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {question.text}
                        </ReactMarkdown>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="pt-6">
                            {question.type === 'Multiple Choice' && question.options && (
                                <div className="space-y-3">
                                {question.options.map((option, optIndex) => {
                                    const isCorrect = question.correctAnswer === option.text;
                                    return (
                                        <div key={optIndex} className={cn(
                                            "p-4 rounded-lg border-2 flex items-start gap-3 transition-colors",
                                            isCorrect 
                                                ? "bg-green-100 dark:bg-green-900/30 border-green-500"
                                                : "bg-red-100 dark:bg-red-900/20 border-destructive/30"
                                        )}>
                                            {isCorrect 
                                                ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" /> 
                                                : <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                                            }
                                            <div className="flex-1">
                                                <div className="prose dark:prose-invert max-w-none custom-prose-style">
                                                     <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{option.text}</ReactMarkdown>
                                                </div>
                                                {option.explanation && 
                                                <div className="text-xs text-muted-foreground mt-1 prose dark:prose-invert max-w-none custom-prose-style">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{option.explanation}</ReactMarkdown>
                                                </div>
                                                }
                                            </div>
                                        </div>
                                    )
                                })}
                                </div>
                            )}
                             {question.type === 'True/False' && (
                                <div className="space-y-3">
                                {['True', 'False'].map((tf) => {
                                    const isCorrect = question.correctAnswer === tf;
                                    return (
                                    <div key={tf} className={cn("p-4 rounded-lg border-2 flex items-center gap-3", isCorrect ? "bg-green-100 dark:bg-green-900/30 border-green-500" : "bg-red-100 dark:bg-red-900/20 border-destructive/30")}>
                                        {isCorrect ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-destructive" />}
                                        <span className="font-medium">{tf}</span>
                                    </div>
                                    )
                                })}
                                </div>
                            )}
                            {(question.type === 'Short Answer' || question.type === 'Fill in the Blank') && (
                                <div className="p-4 rounded-lg border-2 bg-green-100 dark:bg-green-900/30 border-green-500">
                                    <Label className="text-sm font-semibold text-green-800 dark:text-green-300">Correct Answer</Label>
                                    <p className="text-lg font-medium mt-1">{question.correctAnswer}</p>
                                </div>
                            )}
                            {question.type === 'Matching' && (
                                 <div className="space-y-4">
                                    <h4 className="font-bold">Correct Matches</h4>
                                    {Array.isArray(question.correctAnswer) && question.correctAnswer.map((pair, index) => (
                                        <div key={index} className="flex items-center justify-between gap-2 p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                                            <div className="flex flex-col items-center text-center">
                                                {pair.aImage && <Image src={pair.aImage} alt={pair.a} width={50} height={50} className="rounded-md object-cover mb-1" />}
                                                <span className="font-medium">{pair.a}</span>
                                            </div>
                                            <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div className="flex flex-col items-center text-center">
                                                {pair.bImage && <Image src={pair.bImage} alt={pair.b} width={50} height={50} className="rounded-md object-cover mb-1" />}
                                                <span className="font-medium">{pair.b}</span>
                                            </div>
                                        </div>
                                    ))}
                                 </div>
                            )}
                            </CardContent>
                        </Card>
                        
                        {question.explanation && (
                            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                        <Info /> Explanation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="prose dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{question.explanation}</ReactMarkdown>
                                </CardContent>
                            </Card>
                        )}
                        
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare /> Comments ({comments.length})</CardTitle></CardHeader>
                            <CardContent>
                                <form onSubmit={handleCommentSubmit} className="space-y-4">
                                    <Textarea placeholder={user ? "Share your thoughts or ask a question..." : "Please log in to comment."} value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={!user || isSubmittingComment} />
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={!user || isSubmittingComment || !newComment.trim()}>
                                            {isSubmittingComment ? <Loader2 className="animate-spin" /> : "Post Comment"}
                                        </Button>
                                    </div>
                                </form>
                                <Separator className="my-6" />
                                <div className="space-y-6">
                                    {comments.length > 0 ? comments.map(comment => (
                                        <div key={comment.id} className="flex items-start gap-4">
                                            <Avatar>
                                               <AvatarImage src={comment.authorPhotoURL || `https://picsum.photos/seed/${comment.authorName}/40/40`} />
                                                <AvatarFallback>{comment.authorName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Link href={`/profile/${comment.authorId}`} className="font-semibold hover:underline">{comment.authorName}</Link>
                                                    <span className="text-muted-foreground">{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</span>
                                                </div>
                                                <p className="text-foreground mt-1">{comment.text}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center text-muted-foreground">No comments yet. Be the first to start the discussion!</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Question Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span>Asked by: <span className="font-semibold">{question.authorName}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>Asked on: <span className="font-semibold">{question.createdAt.toLocaleDateString()}</span></span>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader>
                                <CardTitle>Community Feedback</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-2">
                                <Button 
                                    variant={userHasLiked ? "default" : "outline"}
                                    size="sm" 
                                    onClick={() => handleVote('like')} 
                                    disabled={isVoting}
                                    className={cn("flex-1", userHasLiked && "bg-green-500 hover:bg-green-600 text-white")}
                                >
                                    <ThumbsUp className="mr-2" /> Like ({question.likes || 0})
                                </Button>
                                <Button 
                                    variant={userHasDisliked ? "destructive" : "outline"} 
                                    size="sm" 
                                    onClick={() => handleVote('dislike')} 
                                    disabled={isVoting}
                                    className="flex-1"
                                >
                                    <ThumbsDown className="mr-2" /> Dislike ({question.dislikes || 0})
                                </Button>
                            </CardContent>
                        </Card>
                        <Button variant="outline" onClick={() => router.back()} className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            Go Back
                        </Button>
                    </aside>
                </div>
            </div>
        </div>
    </div>
  );
}
