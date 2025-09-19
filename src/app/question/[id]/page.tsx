

'use client';

import { useEffect, useState } from 'react';
import { getQuestionById, addComment, getComments, handleQuestionVote } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Option = {
  text: string;
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
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  createdAt: Date;
  authorName: string;
};

type Comment = {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    createdAt: Date;
}

export default function QuestionPage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const questionId = params.id as string;

  useEffect(() => {
    if (!questionId) return;

    const fetchQuestionAndComments = async () => {
      try {
        setLoading(true);
        const [questionData, commentsData] = await Promise.all([
          getQuestionById(questionId),
          getComments('questions', questionId),
        ]);
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
  }, [questionId, toast]);

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
    <div className="container py-12">
       <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tighter">Question Details</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">Review the question, its answer, and community feedback.</p>
      </header>

        <Card>
            <CardHeader>
              <CardTitle>Question</CardTitle>
              <CardDescription className="text-lg text-foreground pt-2">{question.text}</CardDescription>
               <div className="text-sm text-muted-foreground pt-2">
                Asked by {question.authorName} on {question.createdAt.toLocaleDateString()}
               </div>
            </CardHeader>
            <CardContent>
              {question.type === 'Multiple Choice' && question.options && (
                  <RadioGroup value={question.correctAnswer} disabled className="space-y-2">
                  {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.text} id={`q-opt${optIndex}`} />
                      <Label htmlFor={`q-opt${optIndex}`} className="text-base">{option.text}</Label>
                      </div>
                  ))}
                  </RadioGroup>
              )}
              {question.type === 'True/False' && (
                  <RadioGroup value={question.correctAnswer} disabled className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                      <RadioGroupItem value="True" id={`q-true`} />
                      <Label htmlFor={`q-true`}>True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <RadioGroupItem value="False" id={`q-false`} />
                      <Label htmlFor={`q-false`}>False</Label>
                  </div>
                  </RadioGroup>
              )}
              {question.type === 'Short Answer' && (
                  <div>
                      <Label className="text-base font-semibold">Correct Answer:</Label>
                      <p className="text-lg p-2 bg-secondary rounded-md mt-1">{question.correctAnswer}</p>
                  </div>
              )}
               {question.type === 'Matching' && question.matchingOptions && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-center mb-2">Column A</h4>
                                <div className="space-y-2">
                                {question.matchingOptions.columnA.map((item, index) => (
                                    <div key={index} className="p-3 border rounded-md bg-secondary text-center">
                                      {item.image && <Image src={item.image} alt={item.text} width={100} height={100} className="mx-auto mb-2 rounded-md object-cover" />}
                                      {item.text}
                                    </div>
                                ))}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-bold text-center mb-2">Column B</h4>
                                <div className="space-y-2">
                                {question.matchingOptions.columnB.map((item, index) => (
                                    <div key={index} className="p-3 border rounded-md bg-secondary text-center">
                                      {item.image && <Image src={item.image} alt={item.text} width={100} height={100} className="mx-auto mb-2 rounded-md object-cover" />}
                                      {item.text}
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-bold mb-2">Correct Answer</h4>
                            <div className="space-y-2">
                                {Array.isArray(question.correctAnswer) && question.correctAnswer.map((pair, index) => (
                                    <div key={index} className="flex items-center justify-center gap-2 p-2 border rounded-md bg-green-50 dark:bg-green-900/20">
                                        <div className="flex-1 text-center">
                                          {pair.aImage && <Image src={pair.aImage} alt={pair.a} width={80} height={80} className="mx-auto mb-2 rounded-md object-cover" />}
                                          <span className="font-medium">{pair.a}</span>
                                        </div>
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1 text-center">
                                          {pair.bImage && <Image src={pair.bImage} alt={pair.b} width={80} height={80} className="mx-auto mb-2 rounded-md object-cover" />}
                                          <span className="font-medium">{pair.b}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                <Button 
                    variant={userHasLiked ? "default" : "outline"}
                    size="sm" 
                    onClick={() => handleVote('like')} 
                    disabled={isVoting}
                    className={cn(userHasLiked && "bg-green-500 hover:bg-green-600 text-white")}
                >
                    <ThumbsUp className="mr-2" /> Like ({question.likes || 0})
                </Button>
                <Button 
                    variant={userHasDisliked ? "destructive" : "outline"} 
                    size="sm" 
                    onClick={() => handleVote('dislike')} 
                    disabled={isVoting}
                >
                    <ThumbsDown className="mr-2" /> Dislike ({question.dislikes || 0})
                </Button>
              </div>
            </CardFooter>
        </Card>
        
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare /> Comments ({comments.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
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
                    {comments.length > 0 ? comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-4">
                            <Avatar>
                               <AvatarImage src={comment.authorPhotoURL || `https://picsum.photos/seed/${comment.authorName}/40/40`} />
                                <AvatarFallback>{comment.authorName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm">
                                    <Link href={`/profile/${comment.authorId}`} className="font-semibold hover:underline">{comment.authorName}</Link>
                                    <span className="text-muted-foreground">
                                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-foreground mt-1">{comment.text}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
                    )}
                </div>
            </CardContent>
        </Card>

        <div className="mt-8 flex justify-start">
             <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Go Back
            </Button>
        </div>
    </div>
  );
}
