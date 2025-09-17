
'use client';

import { useEffect, useState } from 'react';
import { getQuestionById, updateQuestion, addComment, getComments } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';

type Option = {
  text: string;
};

type Question = {
  id: string;
  text: string;
  type: 'Multiple Choice' | 'True/False' | 'Short Answer';
  options?: Option[];
  correctAnswer: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
  authorName: string;
};

type Comment = {
    id: string;
    text: string;
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
          getComments(questionId),
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
    if (!question) return;

    const currentLikes = question.likes || 0;
    const currentDislikes = question.dislikes || 0;

    const newCount = type === 'like' ? currentLikes + 1 : currentDislikes + 1;
    const updateData = type === 'like' ? { likes: newCount } : { dislikes: newCount };

    setQuestion({ ...question, ...updateData });

    try {
        await updateQuestion(questionId, updateData);
    } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error submitting vote',
          description: (error as Error).message,
        });
        // Revert UI on error
         const revertedCount = type === 'like' ? currentLikes : currentDislikes;
         const revertedUpdate = type === 'like' ? { likes: revertedCount } : { dislikes: revertedCount };
         setQuestion({ ...question, ...revertedUpdate });
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
        const commentData = { text: newComment };
        await addComment(questionId, commentData);
        setNewComment('');
        // Refetch comments to show the new one
        const updatedComments = await getComments(questionId);
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
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => handleVote('like')}>
                  <ThumbsUp className="mr-2" /> Like ({question.likes || 0})
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleVote('dislike')}>
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
                                    <span className="font-semibold">{comment.authorName}</span>
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
