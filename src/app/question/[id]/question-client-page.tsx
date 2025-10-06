
'use client';

import { useEffect, useState } from 'react';
import { getComments, addComment, handleQuestionVote } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, GripVertical, CheckCircle, XCircle, Info, User, Calendar } from 'lucide-react';
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
  createdAt: string; // Serialized Date
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

export default function QuestionClientPage({ initialQuestion }: { initialQuestion: Question }) {
  const [question, setQuestion] = useState<Question>(initialQuestion);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const questionId = initialQuestion.id;

  useEffect(() => {
    const fetchComments = async () => {
      if (!questionId) return;
      try {
        setLoadingComments(true);
        const commentsData = await getComments('questions', questionId);
        setComments(commentsData as Comment[]);
      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching comments',
          description: (error as Error).message,
        });
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [questionId, toast]);

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!user || !question) {
        toast({ variant: "destructive", title: "Please log in to vote." });
        return;
    }
    if (isVoting) return;

    setIsVoting(true);
    
    const originalQuestion = { ...question };
    const hasLiked = question.likedBy?.includes(user.uid);
    const hasDisliked = question.dislikedBy?.includes(user.uid);

    let newLikedBy = [...(question.likedBy || [])];
    let newDislikedBy = [...(question.dislikedBy || [])];

    if (type === 'like') {
        if (hasLiked) { 
            newLikedBy = newLikedBy.filter(uid => uid !== user.uid);
        } else { 
            newLikedBy.push(user.uid);
            if (hasDisliked) { 
                newDislikedBy = newDislikedBy.filter(uid => uid !== user.uid);
            }
        }
    } else { // dislike
        if (hasDisliked) { 
            newDislikedBy = newDislikedBy.filter(uid => uid !== user.uid);
        } else { 
            newDislikedBy.push(user.uid);
            if (hasLiked) { 
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

  const userHasLiked = user && question.likedBy?.includes(user.uid);
  const userHasDisliked = user && question.dislikedBy?.includes(user.uid);

  return (
    <div className="bg-secondary/30">
        <div className="container py-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    {question.subject && <Badge className="mb-2">{question.subject}</Badge>}
                    <h1 className="font-headline text-4xl font-bold tracking-tighter">{question.text}</h1>
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
                                                <span className="font-medium">{option.text}</span>
                                                {option.explanation && <p className="text-xs text-muted-foreground mt-1">{option.explanation}</p>}
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
                                <CardContent>
                                    <p>{question.explanation}</p>
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
                                    {loadingComments ? (
                                        <div className="flex justify-center"><Loader2 className="animate-spin"/></div>
                                    ) : comments.length > 0 ? comments.map(comment => (
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
                                    <span>Asked on: {new Date(question.createdAt).toLocaleDateString()}</span>
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
