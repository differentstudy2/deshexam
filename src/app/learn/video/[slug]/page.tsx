import React from 'react';
import { getMediaItemBySlug, getTopicFullHierarchy, fetchGuideItems } from '@/lib/firebase/guide';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, Share, MoreHorizontal, Bookmark, Flame, PlayCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getMediaItemBySlug('guide_videos', resolvedParams.slug);
  return {
    title: item?.title ? `${item.title} | DeshExam` : 'Video Not Found',
    description: item?.description || 'Watch educational video on DeshExam.',
  };
}

export default async function VideoSinglePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const item = await getMediaItemBySlug('guide_videos', resolvedParams.slug);

  if (!item) {
    notFound();
  }

  // Find the first attachment to get the hierarchy
  let hierarchy: any = null;
  const firstAttachment = item.attachments?.[0];
  if (firstAttachment?.topicId) {
    hierarchy = await getTopicFullHierarchy(firstAttachment.topicId);
  } else if (item.topicId) { // Fallback for old data
    hierarchy = await getTopicFullHierarchy(item.topicId);
  }

  // Fetch all videos to build the playlist and suggested videos
  const allVideos = await fetchGuideItems('guide_videos');
  
  // Suggested videos: take 4 random/latest other videos
  const suggestedVideos = allVideos.filter(v => v.id !== item.id).slice(0, 4);

  // Group videos for the course playlist accordion (Using videoType instead of playlistCategory for now, as requested in classification)
  const playlistGroups = allVideos.reduce((acc: any, curr: any) => {
    const cat = curr.videoType || curr.playlistCategory || 'Lesson Videos';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const courseTitle = hierarchy?.chapter?.title || hierarchy?.subject?.title || 'COMPLETE QUANTITATIVE APTITUDE';
  const authorName = item.instructorName || item.authorName || 'Dr. Ananya Sharma';
  const authorAvatar = item.instructorAvatar || item.authorAvatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704d';
  const authorFollowers = item.authorFollowers || '15k Followers';
  const viewsCount = item.views || item.viewsCount || '123K';
  const likesCount = item.likesCount || '1.2M';
  const commentsCount = item.commentsCount || '2.4K';

  // For Accordion default value, find which category the current video is in
  const currentCategory = item.videoType || item.playlistCategory || 'Lesson Videos';

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Video Content Column (Left Side) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Video Player */}
            <CustomVideoPlayer 
              url={item.videoUrl || item.url} 
              thumbnail={item.thumbnail}
              title={item.title}
            />

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white pt-2">
              {item.title}
            </h1>

            {/* Author and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={authorAvatar} alt={authorName} />
                  <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{authorName}</h3>
                  <p className="text-xs text-slate-500">Expert Educator • {authorFollowers}</p>
                </div>
                <Button size="sm" className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5">
                  Follow
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <Button variant="ghost" className="px-4 hover:bg-slate-200 dark:hover:bg-slate-700 h-9 rounded-none border-r border-slate-200 dark:border-slate-700">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {likesCount}
                  </Button>
                  <Button variant="ghost" className="px-4 hover:bg-slate-200 dark:hover:bg-slate-700 h-9 rounded-none">
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="secondary" className="rounded-full h-9 px-4 bg-slate-100 dark:bg-slate-800">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="secondary" className="rounded-full h-9 w-9 p-0 bg-slate-100 dark:bg-slate-800">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs for Description, Notes, Comments */}
            <div className="mt-4 border-b border-slate-200 dark:border-slate-800">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="bg-transparent border-b-0 p-0 h-auto gap-6 justify-start w-full overflow-x-auto rounded-none">
                  <TabsTrigger 
                    value="description" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-3 font-semibold text-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Description
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-3 font-semibold text-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Notes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="comments" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-3 font-semibold text-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Comments ({commentsCount})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bookmarks" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-3 font-semibold text-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Bookmarks (18)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="pt-4 pb-8 focus-visible:outline-none">
                  <div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 rounded-xl">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-4">
                      {viewsCount} views • {item.createdAt ? new Date(item.createdAt.toMillis? item.createdAt.toMillis() : item.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 mb-6">
                      {item.description ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {item.description}
                        </ReactMarkdown>
                      ) : (
                        <p>No description provided for this session.</p>
                      )}
                    </div>
                    
                    {item.tags && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.split(',').map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-normal">
                            #{tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="py-8 text-center text-slate-500">
                  Notes are synced with your study profile.
                </TabsContent>
                <TabsContent value="comments" className="py-8 text-center text-slate-500">
                  Comments section loading...
                </TabsContent>
                <TabsContent value="bookmarks" className="py-8 text-center text-slate-500">
                  No bookmarks added to this video yet.
                </TabsContent>
              </Tabs>
            </div>

            {/* Suggested Videos */}
            {suggestedVideos.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Suggested Videos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedVideos.map((vid: any) => (
                    <Link href={`/learn/video/${vid.slug || vid.id}`} key={vid.id}>
                      <Card className="border-0 shadow-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg mb-2 relative overflow-hidden">
                           {vid.thumbnail ? (
                             <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                           ) : (
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                               <PlayCircle className="w-10 h-10 text-white" />
                             </div>
                           )}
                           <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                             {vid.duration || '10:00'}
                           </div>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600">
                          {vid.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">{vid.instructorName || vid.authorName || 'Expert Educator'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{vid.views || vid.viewsCount || '10K'} views</p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar (Course Playlist) */}
          <div className="lg:col-span-1">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
              
              {/* Progress Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Overall progress</span>
                  <div className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                    Learning streak <Flame className="w-4 h-4 text-orange-500 ml-1 fill-orange-500" />
                  </div>
                </div>
                <Progress value={24} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-emerald-500" />
                <div className="mt-6">
                  <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-1">Course:</p>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight uppercase">{courseTitle}</h3>
                </div>
              </div>

              {/* Accordion Playlist */}
              <Accordion type="single" collapsible defaultValue={currentCategory} className="w-full">
                {Object.keys(playlistGroups).map((category, idx) => {
                  const categoryVideos = playlistGroups[category];
                  // Calculate total views for the category
                  const catViews = '1.2M';
                  
                  return (
                    <AccordionItem value={category} key={idx} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <div className="flex flex-col items-start text-left">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white capitalize">{category.replace('_', ' ')}</span>
                          <span className="text-xs text-slate-500 mt-0.5 font-normal">{categoryVideos.length} videos</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div className="flex flex-col">
                          {categoryVideos.map((vid: any, vIdx: number) => {
                            const isCurrent = vid.id === item.id;
                            return (
                              <Link href={`/learn/video/${vid.slug || vid.id}`} key={vid.id}>
                                <div className={`flex items-start gap-3 p-3 px-4 transition-colors ${isCurrent ? 'bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                                  {/* Thumbnail */}
                                  <div className="w-24 shrink-0 aspect-video bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden">
                                    {vid.thumbnail ? (
                                      <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                        <PlayCircle className="w-6 h-6 text-slate-400" />
                                      </div>
                                    )}
                                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-semibold px-1 rounded">
                                      {vid.duration || '00:00'}
                                    </div>
                                  </div>
                                  
                                  {/* Info */}
                                  <div className="flex-1 min-w-0 pr-2">
                                    <h4 className={`text-sm font-medium line-clamp-2 leading-tight ${isCurrent ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {vid.title}
                                    </h4>
                                    {isCurrent && (
                                      <Badge className="mt-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-[9px] px-1.5 py-0">
                                        ▶ NOW PLAYING
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Progress Ring Status */}
                                  <div className="shrink-0 pt-1">
                                    {isCurrent ? (
                                      <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin-slow"></div>
                                    ) : vIdx === 0 ? (
                                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}
