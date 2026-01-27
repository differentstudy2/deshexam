
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getQuestionById, addComment, getComments, handleQuestionVote, getAllTextbooks, getClasses } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, User, Calendar, Book, Layers, BarChart, Sparkles, Brain, ChevronRight, Flag, Heart, CheckCircle, XCircle, MessageSquare, ThumbsUp, ThumbsDown, CornerDownRight, Star, ChevronLeft, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import rehypeRaw from 'rehype-raw';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import type { Textbook } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Question = { 
  id: string; 
  text: string; 
  type: string; 
  options?: {text: string, explanation?: string}[];
  matchingOptions?: {
    columnA: { text: string; image?: string }[];
    columnB: { text: string; image?: string }[];
  };
  correctAnswer: any; 
  explanation?: string; 
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  authorName: string;
  authorId: string;
  createdAt: any;
  subject?: string;
  board?: string;
  class?: string;
  exam?: string;
  marks?: number;
};

type Comment = {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    createdAt: Date;
    rating?: number;
    likes: number;
    dislikes: number;
    likedBy: string[];
    dislikedBy: string[];
    parentId: string | null;
    replies?: Comment[];
}

const UserProfileCard = ({ user }: { user: any }) => {
    if (!user) return null;
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/48/48`} />
                        <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{user.displayName}</p>
                        <Badge variant="outline">Helping Hand</Badge>
                    </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary"/> 125 pts</p>
                     <div className="flex items-center gap-2 text-muted-foreground">
                        <Brain className="w-4 h-4"/> Brainly Space
                     </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                         <User className="w-4 h-4"/> First Contact
                     </div>
                </div>
                 <Button asChild variant="link" className="px-0 mt-4">
                    <Link href="/dashboard">
                        View My Achievements <ChevronRight className="w-4 h-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};

const TextbookSolutionsSection = ({ currentClass }: { currentClass?: string }) => {
    const [textbooks, setTextbooks] = useState<Textbook[]>([]);
    const [allClasses, setAllClasses] = useState<{id: string, name: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState<string | 'all'>('all');

    useEffect(() => {
        const fetchTextbooksAndClasses = async () => {
            try {
                const [textbookData, classData] = await Promise.all([
                    getAllTextbooks(),
                    getClasses()
                ]);
                setTextbooks(textbookData as Textbook[]);
                setAllClasses(classData as {id: string, name: string}[]);
                if (currentClass) {
                    setSelectedClass(currentClass);
                }
            } catch (error) {
                console.error("Failed to fetch textbooks or classes for showcase", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTextbooksAndClasses();
    }, [currentClass]);

    const filteredTextbooks = useMemo(() => {
        if (selectedClass === 'all') return textbooks;
        return textbooks.filter(book => book.class === selectedClass);
    }, [selectedClass, textbooks]);

    if (loading) {
        return (
             <div className="mt-12">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <div className="flex gap-4">
                   {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-40" />)}
                </div>
             </div>
        );
    }
    
    if (textbooks.length === 0) return null;

    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold font-headline">Find Textbook Solutions?</h2>
                 <Button variant="ghost" asChild>
                    <Link href="/textbook-solutions">See all</Link>
                 </Button>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
                <Button variant={selectedClass === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedClass('all')}>
                    All Classes
                </Button>
                {allClasses.map(c => (
                     <Button key={c.id} variant={selectedClass === c.name ? 'default' : 'outline'} size="sm" onClick={() => setSelectedClass(c.name)}>
                        {c.name}
                    </Button>
                ))}
            </div>
            <Carousel opts={{ align: "start", loop: false }}>
                <CarouselContent className="-ml-4">
                    {filteredTextbooks.slice(0, 8).map((book) => (
                         <CarouselItem key={book.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-4">
                            <Card className="h-full hover:shadow-md transition-shadow">
                                 <Link href={`/textbook-solutions/${(book as any).id}`}>
                                    <div className="aspect-[2/3] w-full bg-secondary rounded-t-lg overflow-hidden">
                                      <Image src={book.featureImage || `https://picsum.photos/seed/${book.id}/200/280`} alt={book.title} width={200} height={280} className="w-full h-full object-contain" />
                                    </div>
                                    <CardContent className="p-2 text-center">
                                        <p className="text-sm font-semibold truncate">{book.title}</p>
                                        <p className="text-xs text-muted-foreground">{book.subject}</p>
                                    </CardContent>
                                 </Link>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-[-12px]" />
                <CarouselNext className="right-[-12px]" />
            </Carousel>
        </div>
    )
};


export default function QuestionClientPage({ questionId }: { questionId: string }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isCommentVoting, setIsCommentVoting] = useState<{[key: string]: boolean}>({});

  
  const isAnswerRevealed = showAnswer || selectedAnswer !== null;

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

  useEffect(() => {
    if (!questionId) return;

    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const questionData = await getQuestionById(questionId);
        if (!questionData) {
            toast({
              variant: "destructive",
              title: 'Question not found',
            });
            router.push('/dashboard/all-questions');
            return;
        }
        
        const q = questionData as Question;

        if (q.type === 'Matching' && q.correctAnswer && Array.isArray(q.correctAnswer)) {
            if (!q.matchingOptions) {
                const pairs = q.correctAnswer as { a: string, aImage?: string, b: string, bImage?: string }[];
                const columnA = pairs.map(p => ({ text: p.a, image: p.aImage }));
                let columnB = pairs.map(p => ({ text: p.b, image: p.bImage }));
                
                for (let i = columnB.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [columnB[i], columnB[j]] = [columnB[j], columnB[i]];
                }
                q.matchingOptions = { columnA, columnB };
            } else if (q.matchingOptions.columnB) {
                 const shuffledColumnB = [...(q.matchingOptions.columnB || [])].sort(() => Math.random() - 0.5);
                 q.matchingOptions.columnB = shuffledColumnB;
            }
        }
        setQuestion(q);
        fetchComments();
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

    fetchQuestion();
  }, [questionId, toast, router]);

  const handleVote = async (type: 'like') => {
    if (!user || !question) {
        toast({ variant: "destructive", title: "Please log in to vote." });
        return;
    }
    if (isVoting) return;

    setIsVoting(true);
    
    const originalQuestion = { ...question };
    const hasLiked = question.likedBy?.includes(user.uid);

    let newLikedBy = [...(question.likedBy || [])];

    if (hasLiked) {
        newLikedBy = newLikedBy.filter(uid => uid !== user.uid);
    } else {
        newLikedBy.push(user.uid);
    }
    
    const updatedQuestion = {
        ...question,
        likedBy: newLikedBy,
        likes: newLikedBy.length,
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

  const handleShowAnswerClick = () => {
    setShowAnswer(true);
    setSelectedAnswer('reveal');
  };

  const handleCommentSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Please log in to comment." });
        return;
    }
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    setIsSubmittingComment(true);
    try {
        await addComment('questions', questionId, { text, parentId });
        setNewComment('');
        setReplyText('');
        setReplyingTo(null);
        await fetchComments();
        toast({ title: parentId ? "Reply posted!" : "Comment posted!" });
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

  const handleCommentVote = async (commentId: string, voteType: 'like' | 'dislike') => {
    if (!user) {
        toast({ variant: "destructive", title: "Please log in to vote." });
        return;
    }
    if (isCommentVoting[commentId]) return;

    setIsCommentVoting(prev => ({...prev, [commentId]: true}));
    
    try {
        await handleCommentVote('questions', questionId, commentId, voteType);
        fetchComments();
    } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error submitting vote',
          description: (error as Error).message,
        });
    } finally {
        setIsCommentVoting(prev => ({...prev, [commentId]: false}));
    }
  }

  const nestedComments = useMemo(() => {
    const commentMap: { [key: string]: Comment & { replies: Comment[] } } = {};
    const topLevelComments: (Comment & { replies: Comment[] })[] = [];

    comments.forEach(comment => {
        commentMap[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach(comment => {
        if (comment.parentId && commentMap[comment.parentId]) {
            commentMap[comment.parentId].replies.push(commentMap[comment.id]);
        } else {
            topLevelComments.push(commentMap[comment.id]);
        }
    });

    return topLevelComments;
  }, [comments]);
  
  const StarRating = ({ rating, interactive = false, onRate, onHover }: { rating: number, interactive?: boolean, onRate?: (rate: number) => void, onHover?: (rate: number) => void }) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);
    return (
        <div className="flex items-center" onMouseLeave={() => onHover && onHover(0)}>
            {stars.map(star => (
                <Star
                    key={star}
                    className={cn(
                        "w-5 h-5",
                        star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300",
                        interactive && "cursor-pointer"
                    )}
                    onClick={() => interactive && onRate && onRate(star)}
                    onMouseEnter={() => interactive && onHover && onHover(star)}
                />
            ))}
        </div>
    );
  };
  
  const ratings = comments.filter(c => c.rating && c.rating > 0).map(c => c.rating!);
  const averageRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
  const totalRatings = ratings.length;


  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const userHasLiked = user && comment.likedBy?.includes(user.uid);
    const userHasDisliked = user && comment.dislikedBy?.includes(user.uid);
    const userRootComment = comments.find(c => c.authorId === comment.authorId && !c.parentId && c.rating);
    const displayRating = userRootComment?.rating;

    return (
      <div key={comment.id} className={cn("flex items-start gap-4", isReply && "mt-4")}>
          <Avatar>
            <AvatarImage src={comment.authorPhotoURL || `https://picsum.photos/seed/${comment.authorName}/40/40`} />
            <AvatarFallback>{comment.authorName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
              <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 text-sm">
                      <Link href={`/profile/${comment.authorId}`} className="font-semibold hover:underline">{comment.authorName}</Link>
                      <span className="text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                  </div>
                   {displayRating && <StarRating rating={displayRating} />}
              </div>
              <p className="text-foreground mt-1">{comment.text}</p>
              <div className="flex items-center gap-1 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => handleCommentVote(comment.id, 'like')} disabled={isCommentVoting[comment.id]}>
                      <ThumbsUp className={cn("mr-2 h-4 w-4", userHasLiked && "fill-current")} /> {comment.likes || 0}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleCommentVote(comment.id, 'dislike')} disabled={isCommentVoting[comment.id]}>
                      <ThumbsDown className={cn("mr-2 h-4 w-4", userHasDisliked && "fill-current")} /> {comment.dislikes || 0}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                      <CornerDownRight className="mr-2 h-4 w-4" /> Reply
                  </Button>
              </div>

              {replyingTo === comment.id && (
                  <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} className="mt-4 space-y-2">
                      <Textarea 
                          placeholder={`Replying to ${comment.authorName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          disabled={isSubmittingComment}
                          className="h-20"
                      />
                      <div className="flex justify-end gap-2">
                           <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                           <Button type="submit" size="sm" disabled={isSubmittingComment || !replyText.trim()}>
                            {isSubmittingComment ? <Loader2 className="animate-spin" /> : "Post Reply"}
                           </Button>
                      </div>
                  </form>
              )}

              {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2">
                      {comment.replies.map(reply => renderComment(reply, true))}
                  </div>
              )}
          </div>
      </div>
    );
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
  
  return (
    <div className="bg-secondary/30">
        <div className="container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={`https://picsum.photos/seed/${question.authorName}/40/40`} />
                                        <AvatarFallback>{question.authorName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{question.authorName}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(question.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-green-600 border-green-600">Answered</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground pt-4">
                                {question.board && <Badge variant="secondary">{question.board}</Badge>}
                                {question.class && <Badge variant="secondary">{question.class}</Badge>}
                                {question.subject && <Badge variant="secondary">{question.subject}</Badge>}
                                {question.type && <Badge variant="secondary">{question.type}</Badge>}
                                {question.marks && <Badge variant="secondary">{question.marks} Mark{question.marks > 1 ? 's' : ''}</Badge>}
                            </div>
                             <div className="prose dark:prose-invert max-w-none pt-4">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                  {`## ${question.text}`}
                                </ReactMarkdown>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {question.type === 'True/False' && question.options && (
                                <div className="space-y-3">
                                    {['True', 'False'].map((optionText, index) => {
                                        const isCorrectAnswer = question.correctAnswer === optionText;
                                        const isSelected = selectedAnswer === optionText;
                                        const explanation = question.options?.find(o => o.text === optionText)?.explanation;
                                        
                                        return (
                                            <Card
                                                key={index}
                                                onClick={() => !isAnswerRevealed && setSelectedAnswer(optionText)}
                                                className={cn(
                                                    "cursor-pointer transition-all border-2",
                                                    isAnswerRevealed && isCorrectAnswer ? "border-green-500 bg-green-100/20" : "border-border hover:bg-accent",
                                                    isAnswerRevealed && isSelected && !isCorrectAnswer ? "border-destructive bg-red-100/20" : ""
                                                )}
                                            >
                                                <CardContent className="p-4 flex items-start gap-4">
                                                    {isAnswerRevealed ? (
                                                        isCorrectAnswer ? 
                                                        <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" /> :
                                                        isSelected ? 
                                                        <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" /> :
                                                        <div className="w-6 h-6 mt-1 flex-shrink-0 rounded-full border-2 border-muted-foreground" />
                                                    ) : (
                                                        <div className="w-6 h-6 mt-1 flex-shrink-0 rounded-full border-2 border-muted-foreground" />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="font-medium text-lg prose dark:prose-invert" style={{fontSize: '1.5rem'}}>{optionText}</div>
                                                        {isAnswerRevealed && explanation && (
                                                            <div className="mt-2 text-muted-foreground prose dark:prose-invert max-w-none" style={{fontSize: '1rem'}}>
                                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{explanation}</ReactMarkdown>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                            {question.type === 'Matching' && question.matchingOptions?.columnA && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 items-start">
                                        <div>
                                            <h4 className="font-bold text-center mb-2">Column A</h4>
                                            <ul className="space-y-2">
                                                {question.matchingOptions.columnA.map((item, index) => (
                                                    <li key={index} className="p-3 border rounded-md text-center bg-secondary flex flex-col items-center">
                                                        {item.image && <Image src={item.image} alt={item.text} width={100} height={100} className="mx-auto mb-2 rounded-md" />}
                                                        {item.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-center mb-2">Column B</h4>
                                            <ul className="space-y-2">
                                                {question.matchingOptions.columnB.map((item, index) => (
                                                    <li key={index} className="p-3 border rounded-md text-center bg-secondary flex flex-col items-center">
                                                         {item.image && <Image src={item.image} alt={item.text} width={100} height={100} className="mx-auto mb-2 rounded-md" />}
                                                        {item.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex-wrap gap-4">
                            {['Fill in the Blank', 'Matching'].includes(question.type) && !isAnswerRevealed && (
                                <Button onClick={handleShowAnswerClick}>See Answer</Button>
                            )}
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleVote('like')} disabled={isVoting}>
                                    <Heart className={cn("w-5 h-5", userHasLiked && "fill-red-500 text-red-500")} />
                                </Button>
                                <span className="text-sm font-bold">{question.likes || 0}</span>
                            </div>
                            <Button variant="ghost" size="icon">
                                <Flag className="w-5 h-5 text-muted-foreground" />
                            </Button>
                             <div className="flex items-center">
                                 <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                 <span className="ml-1 font-bold">5.0</span>
                                 <span className="ml-1 text-xs text-muted-foreground">(1 vote)</span>
                             </div>
                        </CardFooter>
                    </Card>

                     {(isAnswerRevealed && (question.type === 'Fill in the Blank')) && (
                         <Card>
                            <CardHeader>
                                <CardTitle>Correct Answer</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <div className="text-lg font-bold prose dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                        {question.correctAnswer}
                                    </ReactMarkdown>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {(isAnswerRevealed && question.type === 'Matching') && (
                         <Card>
                            <CardHeader>
                                <CardTitle>Correct Answer</CardTitle>
                            </CardHeader>
                             <CardContent>
                                {Array.isArray(question.correctAnswer) ? (
                                    <div className="space-y-2">
                                        {question.correctAnswer.map((pair: {a: string, aImage?: string, b: string, bImage?: string}, pairIndex: number) => (
                                            <div key={pairIndex} className="p-3 border rounded-lg bg-green-100/20 border-green-500/50">
                                                <div className="flex items-center justify-center gap-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        {pair.aImage && <Image src={pair.aImage} alt={pair.a} width={40} height={40} className="rounded-md object-cover mb-1" />}
                                                        <span className="font-semibold">{pair.a}</span>
                                                    </div>
                                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                    <div className="flex flex-col items-center">
                                                        {pair.bImage && <Image src={pair.bImage} alt={pair.b} width={40} height={40} className="rounded-md object-cover mb-1" />}
                                                        <span className="font-semibold">{pair.b}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-lg font-bold prose dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {question.correctAnswer}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                    
                    {['Short Answer', 'Descriptive'].includes(question.type) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{question.type === 'Descriptive' ? 'Model Answer' : 'Answer'}</CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                    {question.correctAnswer}
                                </ReactMarkdown>
                            </CardContent>
                        </Card>
                    )}

                    {(isAnswerRevealed || ['Short Answer', 'Descriptive'].includes(question.type)) && question.explanation && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Explanation</CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                    {question.explanation}
                                </ReactMarkdown>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                            <MessageSquare /> Comments ({comments.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => handleCommentSubmit(e)} className="space-y-4">
                                <Textarea 
                                    placeholder={user ? "Write a comment..." : "Please log in to write a comment."}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={!user || isSubmittingComment}
                                />
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
                                ) : nestedComments.length > 0 ? nestedComments.map(comment => renderComment(comment)) : (
                                    <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <TextbookSolutionsSection currentClass={question.class} />
                    
                </div>

                <aside className="space-y-6">
                    <UserProfileCard user={user} />
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center text-lg">Advertisement</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-48 bg-secondary rounded-b-lg">
                            <span className="text-muted-foreground">Ad Space</span>
                        </CardContent>
                    </Card>
                </aside>
            </div>
             <div className="flex justify-between items-center mt-12">
                <Button variant="ghost"><ChevronLeft className="mr-2"/> Previous</Button>
                <Button variant="ghost">Next <ChevronRight className="ml-2"/></Button>
            </div>
        </div>
    </div>
  );

    
}

    

    