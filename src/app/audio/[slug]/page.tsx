import React from 'react';
import { getMediaItemBySlug, fetchGuideItems } from '@/lib/firebase/guide';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Share, MoreHorizontal, PlayCircle, Headphones, Volume2, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AudioPlayerPaywall } from '@/components/audio/AudioPlayerPaywall';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const item = decodedSlug === 'test' 
    ? { title: 'Advanced Audio Engineering Techniques & Masterclass', description: 'A comprehensive masterclass on modern audio production.', seoTitle: 'Audio Masterclass | DeshExam', seoDescription: 'Learn from industry veterans about compression and EQ.' }
    : await getMediaItemBySlug('guide_audios', decodedSlug);
  return {
    title: item?.seoTitle || (item?.title ? `${item.title} | DeshExam Audio` : 'Audio Not Found'),
    description: item?.seoDescription || item?.shortDescription || item?.description || 'Listen to educational audio tracks on DeshExam.',
    openGraph: {
      title: item?.ogTitle || item?.seoTitle || item?.title,
      description: item?.ogDescription || item?.seoDescription || item?.shortDescription,
      images: item?.ogImage || item?.featureImage || item?.thumbnail ? [item.ogImage || item.featureImage || item.thumbnail] : [],
    },
    alternates: {
      canonical: item?.canonicalUrl || undefined
    }
  };
}

export default async function AudioSinglePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  
  let item;
  if (decodedSlug === 'test') {
    item = {
      id: 'test',
      slug: 'test',
      title: 'Advanced Audio Engineering Techniques & Masterclass',
      description: 'In this masterclass, we dive deep into the intricacies of mixing, mastering, and modern sound design. Learn from industry veterans about compression, EQ balancing, and creating spatial depth. This track is designed for both beginners and experienced producers looking to refine their ear.',
      shortDescription: 'A comprehensive masterclass on modern audio production.',
      audioType: 'Masterclass',
      isPremium: true,
      previewDuration: 10,
      boardId: 'CBSE',
      classId: 'Class 12',
      subjectId: 'Physics',
      featureImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      instructorName: 'Dr. Sarah Jenkins',
      instructorAvatar: 'https://i.pravatar.cc/150?u=sarah',
      instructorQualification: 'Lead Sound Engineer',
      authorFollowers: '45K Followers',
      views: 12400,
      likesCount: '4.2K',
      commentsCount: '342',
      createdAt: new Date(),
      transcript: 'Welcome to this advanced masterclass. Today we will cover...\n\n### 1. The Basics of Compression\nCompression is not just about volume control; it\'s about shaping the envelope of a sound. By adjusting the attack and release, we can completely alter the punchiness of a kick drum or the sustain of a bass guitar.\n\n### 2. Equalization Strategies\nWhen approaching EQ, always subtract before you add. If a mix sounds muddy, don\'t boost the highs; cut the low-mids around 250Hz. This creates headroom and clarity without harshness.',
      resources: [
        { title: 'Mixing & Mastering Cheat Sheet', type: 'PDF', url: '#' },
        { title: 'Drum Sample Pack Vol 1', type: 'ZIP', url: '#' }
      ],
      tags: ['audio', 'engineering', 'masterclass', 'mixing']
    };
  } else {
    item = await getMediaItemBySlug('guide_audios', decodedSlug);
  }

  if (!item) {
    notFound();
  }

  // Fetch all audios to build the playlist and suggested audios
  const allAudios = await fetchGuideItems('guide_audios');
  
  // Suggested audios: take 4 random/latest other audios
  const suggestedAudios = allAudios.filter(a => a.id !== item.id).slice(0, 4);

  // Group audios for the playlist accordion
  const playlistGroups = allAudios.reduce((acc: any, curr: any) => {
    const cat = curr.audioType || 'General Audio';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const authorName = item.instructorName || item.authorName || 'DeshExam Instructor';
  const authorAvatar = item.instructorAvatar || item.authorAvatar || 'https://i.pravatar.cc/150?u=audioinstructor';
  const authorFollowers = item.authorFollowers || '10k Followers';
  const viewsCount = item.views || item.listens || item.viewsCount || '5K';
  const likesCount = item.likesCount || '800';
  const commentsCount = item.commentsCount || '120';

  // For Accordion default value, find which category the current audio is in
  const currentCategory = item.audioType || 'General Audio';

  // Construct JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: item.title,
    description: item.seoDescription || item.shortDescription || item.description,
    contentUrl: item.audioUrl || item.url,
    duration: item.duration ? `PT${item.duration.replace(':', 'M')}S` : undefined, // basic conversion assuming MM:SS
    encodingFormat: 'audio/mpeg',
    thumbnailUrl: item.featureImage || item.thumbnail,
    uploadDate: item.createdAt instanceof Date ? item.createdAt.toISOString() : (item.createdAt?.toMillis ? new Date(item.createdAt.toMillis()).toISOString() : new Date().toISOString()),
    author: {
      '@type': 'Person',
      name: authorName,
      image: authorAvatar,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DeshExam',
      logo: {
        '@type': 'ImageObject',
        url: 'https://deshexam.com/logo.png' // Replace with actual logo URL
      }
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12">
      {/* Inject Structured Data */}
      {item.schemaEnabled !== false && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Audio Content Column (Left Side) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Custom Audio Player Container */}
            <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
              <div className="relative h-48 md:h-64 w-full bg-slate-800">
                {/* Background Image / Cover */}
                {item.featureImage || item.thumbnail ? (
                  <>
                    <img src={item.featureImage || item.thumbnail} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Headphones className="w-32 h-32 text-white" />
                  </div>
                )}
                
                {/* Foreground Track Info overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end items-start z-10">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 uppercase tracking-wider text-[10px]">
                      {item.audioType || 'Track'}
                    </Badge>
                    {item.boardId && (
                      <Badge className="bg-slate-800/80 hover:bg-slate-700 text-white border-0 uppercase tracking-wider text-[10px] backdrop-blur-md">
                        {item.boardId}
                      </Badge>
                    )}
                    {item.classId && (
                      <Badge className="bg-slate-800/80 hover:bg-slate-700 text-white border-0 uppercase tracking-wider text-[10px] backdrop-blur-md">
                        {item.classId.replace('-', ' ')}
                      </Badge>
                    )}
                    {item.subjectId && (
                      <Badge className="bg-slate-800/80 hover:bg-slate-700 text-white border-0 uppercase tracking-wider text-[10px] backdrop-blur-md">
                        {item.subjectId}
                      </Badge>
                    )}
                    {item.isPremium && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 uppercase tracking-wider text-[10px] shadow-sm">
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md line-clamp-2">
                    {item.title}
                  </h1>
                </div>
              </div>

              {/* Player Controls (Paywall enabled wrapper) */}
              <AudioPlayerPaywall 
                audioUrl={item.audioUrl || item.url}
                allowDownload={item.allowDownload}
                isPremium={item.isPremium}
                previewDuration={item.previewDuration}
              />
            </div>

            {/* Author and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-indigo-100">
                  <AvatarImage src={authorAvatar} alt={authorName} />
                  <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{authorName}</h3>
                  <p className="text-xs text-slate-500">{item.instructorQualification || 'Audio Instructor'} • {authorFollowers}</p>
                </div>
                <Button size="sm" className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5">
                  Follow
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <Button variant="ghost" className="px-4 hover:bg-slate-200 dark:hover:bg-slate-700 h-9 rounded-none border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {likesCount}
                  </Button>
                  <Button variant="ghost" className="px-4 hover:bg-slate-200 dark:hover:bg-slate-700 h-9 rounded-none text-slate-600 dark:text-slate-300">
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="secondary" className="rounded-full h-9 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="secondary" className="rounded-full h-9 w-9 p-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs for Description, Transcript, Resources, Comments */}
            <div className="mt-4 border-b border-slate-200 dark:border-slate-800">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="bg-transparent border-b-0 p-0 h-auto gap-6 justify-start w-full overflow-x-auto rounded-none">
                  <TabsTrigger 
                    value="description" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 py-3 font-semibold text-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Track Info
                  </TabsTrigger>
                  <TabsTrigger 
                    value="transcript" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 py-3 font-semibold text-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Transcript
                  </TabsTrigger>
                  {item.resources && item.resources.length > 0 && (
                    <TabsTrigger 
                      value="resources" 
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 py-3 font-semibold text-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                    >
                      Resources
                    </TabsTrigger>
                  )}
                  <TabsTrigger 
                    value="comments" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 py-3 font-semibold text-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Comments ({commentsCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="pt-4 pb-8 focus-visible:outline-none">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-4">
                      {viewsCount} listens • {item.createdAt ? new Date(item.createdAt.toMillis? item.createdAt.toMillis() : item.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                    {item.shortDescription && (
                      <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        {item.shortDescription}
                      </p>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 mb-6">
                      {item.description ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {item.description}
                        </ReactMarkdown>
                      ) : (
                        <p>No description provided for this audio track.</p>
                      )}
                    </div>
                    {item.tags && (Array.isArray(item.tags) ? item.tags.length > 0 : typeof item.tags === 'string' && item.tags.length > 0) && (
                      <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        {(Array.isArray(item.tags) ? item.tags : item.tags.split(',')).map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200">
                            #{tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="transcript" className="py-6 focus-visible:outline-none">
                  {item.transcript ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-left">
                      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {item.transcript}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900 py-16 text-center rounded-xl border border-slate-100 dark:border-slate-800 border-dashed">
                      <Headphones className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">Interactive transcript is not available for this track yet.</p>
                    </div>
                  )}
                </TabsContent>

                {item.resources && item.resources.length > 0 && (
                  <TabsContent value="resources" className="py-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {item.resources.map((res: any, i: number) => (
                        <a href={res.url} target="_blank" rel="noreferrer" key={i}>
                          <Card className="p-4 flex items-center gap-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer shadow-sm bg-white dark:bg-slate-900">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
                              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{res.title || 'Downloadable Resource'}</h4>
                              <p className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">{res.type}</p>
                            </div>
                            <Download className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                          </Card>
                        </a>
                      ))}
                    </div>
                  </TabsContent>
                )}
                
                <TabsContent value="comments" className="py-8 text-center text-slate-500 focus-visible:outline-none">
                  Comments section loading...
                </TabsContent>
              </Tabs>
            </div>

            {/* Suggested Audios */}
            {suggestedAudios.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">More from Audio Library</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {suggestedAudios.map((audio: any) => (
                    <Link href={`/audio/${audio.slug || audio.id}`} key={audio.id}>
                      <Card className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer group h-full">
                        <div className="w-20 shrink-0 aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden flex items-center justify-center">
                           {audio.thumbnail ? (
                             <img src={audio.thumbnail} alt={audio.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                           ) : (
                             <Headphones className="w-6 h-6 text-indigo-300" />
                           )}
                           <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <PlayCircle className="w-8 h-8 text-white" />
                           </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                            {audio.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 truncate">{audio.instructorName || 'DeshExam'}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar (Audio Playlist) */}
          <div className="lg:col-span-1">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6 overflow-hidden">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-indigo-100 leading-tight">Audio Collections</h3>
                  <p className="text-xs text-indigo-600/80 dark:text-indigo-400">Discover related tracks</p>
                </div>
              </div>

              {/* Accordion Playlist */}
              <Accordion type="single" collapsible defaultValue={currentCategory} className="w-full">
                {Object.keys(playlistGroups).map((category, idx) => {
                  const categoryAudios = playlistGroups[category];
                  
                  return (
                    <AccordionItem value={category} key={idx} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <div className="flex flex-col items-start text-left">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white capitalize">{category.replace('_', ' ')}</span>
                          <span className="text-xs text-slate-500 mt-0.5 font-normal">{categoryAudios.length} tracks</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="flex flex-col">
                          {categoryAudios.map((aud: any) => {
                            const isCurrent = aud.id === item.id;
                            return (
                              <Link href={`/audio/${aud.slug || aud.id}`} key={aud.id}>
                                <div className={`flex items-center gap-3 p-3 px-4 transition-colors ${isCurrent ? 'bg-indigo-50 dark:bg-indigo-950/20 border-l-4 border-indigo-500' : 'hover:bg-white dark:hover:bg-slate-900'}`}>
                                  {/* Play Icon */}
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {isCurrent ? (
                                      <div className="w-3 h-3 bg-indigo-600 rounded-sm animate-pulse" /> // Fake pause/playing equalizer block
                                    ) : (
                                      <PlayCircle className="w-4 h-4 ml-0.5" />
                                    )}
                                  </div>
                                  
                                  {/* Info */}
                                  <div className="flex-1 min-w-0 pr-2">
                                    <h4 className={`text-sm font-medium line-clamp-1 ${isCurrent ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {aud.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-400">{aud.duration || '00:00'}</span>
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
