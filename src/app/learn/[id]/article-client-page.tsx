
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getComments, addComment, handleCommentVote } from '@/lib/firebase/firestore';
import { Loader2, ArrowLeft, User, Calendar, MessageSquare, Star, ThumbsUp, ThumbsDown, CornerDownRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import rehypeRaw from 'rehype-raw';


type Article = {
  id: string;
  title: string;
  subject: string;
  description: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  testType: string;
  featureImage?: string;
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

export default function ArticleClientPage({ article }: { article: Article }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { toast } = useToast();
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState<{[key: string]: boolean}>({});

  const fetchComments = async () => {
    if (!article.id) return;
    try {
      setLoadingComments(true);
      const commentsData = await getComments('content', article.id);
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
    fetchComments();
  }, [article.id]);
  
  const userHasCommented = useMemo(() => {
    if (!user) return false;
    return comments.some(comment => comment.authorId === user.uid);
  }, [comments, user]);

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
        const commentData: { text: string; rating?: number; parentId?: string | null } = { 
          text,
          parentId
        };
        if (!parentId && !userHasCommented) {
            commentData.rating = rating;
        }

        await addComment('content', article.id, commentData);
        setNewComment('');
        setReplyText('');
        setReplyingTo(null);
        setRating(4);
        
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

  const handleVote = async (commentId: string, voteType: 'like' | 'dislike') => {
    if (!user) {
        toast({ variant: "destructive", title: "Please log in to vote." });
        return;
    }
    if (isVoting[commentId]) return;

    setIsVoting(prev => ({...prev, [commentId]: true}));
    
    try {
        await handleCommentVote('content', article.id, commentId, voteType);
        fetchComments();
    } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error submitting vote',
          description: (error as Error).message,
        });
    } finally {
        setIsVoting(prev => ({...prev, [commentId]: false}));
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
                  <Button variant="ghost" size="sm" onClick={() => handleVote(comment.id, 'like')} disabled={isVoting[comment.id]}>
                      <ThumbsUp className={cn("mr-2 h-4 w-4", userHasLiked && "fill-current")} /> {comment.likes || 0}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleVote(comment.id, 'dislike')} disabled={isVoting[comment.id]}>
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

  return (
    <div className="container py-12">
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <div className="mb-4">
                    <Link href="/learn" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Back to all articles
                    </Link>
                </div>
                <p className="text-primary font-semibold">{article.subject}</p>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mt-1">{article.title}</h1>
                <p className="text-muted-foreground text-lg mt-3">{article.description}</p>
                <div className="flex items-center text-sm text-muted-foreground space-x-4 mt-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={`https://picsum.photos/seed/${article.authorId}/24/24`} />
                        <AvatarFallback>{article.authorName?.[0]}</AvatarFallback>
                      </Avatar>
                      <span>{article.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Published on {article.createdAt}</span>
                    </div>
                     {totalRatings > 0 && (
                        <div className="flex items-center gap-1.5">
                           <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                           <span className="font-semibold text-foreground">{averageRating.toFixed(1)}</span>
                           <span>({totalRatings} ratings)</span>
                        </div>
                    )}
                </div>
            </header>

            <Image
                src={article.featureImage || `https://picsum.photos/seed/${article.id}/800/450`}
                alt={article.title}
                width={800}
                height={450}
                className="w-full h-auto object-cover rounded-lg mb-8 shadow-lg"
                data-ai-hint={`${article.subject} concept`}
                priority
            />

            <article 
              className="prose dark:prose-invert lg:prose-xl max-w-none"
            >
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                    {article.body}
                </ReactMarkdown>
            </article>

            <Separator className="my-12" />

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <MessageSquare /> Comments ({comments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => handleCommentSubmit(e)} className="space-y-4">
                        {!userHasCommented && (
                            <div className="space-y-2">
                                <label className="font-medium">Your Rating</label>
                                <StarRating 
                                    rating={hoverRating || rating} 
                                    interactive={true}
                                    onRate={setRating}
                                    onHover={setHoverRating}
                                />
                            </div>
                        )}
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
        </div>
    </div>
  );
}
