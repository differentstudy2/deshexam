import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/lib/firebase/firestore';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  Tag as TagIcon, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Link2 
} from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getContentBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const cleanDescription = post.description?.substring(0, 160).replace(/<[^>]*>?/gm, '') || 'Read this post on DeshExam.';

  return {
    title: `${post.title} - DeshExam Blog`,
    description: cleanDescription,
    openGraph: {
      images: post.featureImage ? [post.featureImage] : [],
    }
  };
}

// Helper to calculate reading time
function getReadingTime(htmlContent: string) {
  if (!htmlContent) return 1;
  const text = htmlContent.replace(/<[^>]*>?/gm, '');
  const wordCount = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
  return readingTime;
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getContentBySlug(params.slug);

  if (!post) {
    notFound();
  }

  let publishDate = post.publishedAt ? new Date(post.publishedAt) : new Date();
  if (isNaN(publishDate.getTime())) {
    publishDate = new Date();
  }
  
  const tagsList = post.tags && typeof post.tags === 'string' 
    ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean) 
    : [];

  const readingTime = getReadingTime(post.description || '');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-24 font-body selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/50 dark:selection:text-indigo-100">
      
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-slate-100 dark:border-slate-900 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2 opacity-50 flex-shrink-0" />
          <Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</Link>
          {post.category && (
            <>
              <ChevronRight className="w-4 h-4 mx-2 opacity-50 flex-shrink-0" />
              <span className="text-slate-800 dark:text-slate-200">{post.category}</span>
            </>
          )}
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-4 sm:px-6 pt-12 md:pt-20">
        
        {/* Header Section */}
        <header className="max-w-3xl mx-auto mb-12 text-center md:text-left">
          {post.category && (
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase">
                {post.category}
              </span>
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] font-headline tracking-tight mb-8">
            {post.title}
          </h1>
          
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6 py-6 border-y border-slate-100 dark:border-slate-800/60">
            {/* Author Info */}
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{post.authorName || 'Anonymous'}</p>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(publishDate, 'MMM d, yyyy')}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {readingTime} min read</span>
                </div>
              </div>
            </div>
            
            {/* Social Share (Desktop inline, mobile center) */}
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
              <span className="text-sm font-medium mr-2">Share:</span>
              <button className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 dark:hover:border-indigo-500/30 transition-all">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 dark:hover:border-indigo-500/30 transition-all">
                <Linkedin className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 dark:hover:border-indigo-500/30 transition-all">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 dark:hover:border-indigo-500/30 transition-all" title="Copy Link">
                <Link2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Feature Image Banner */}
        {post.featureImage && (
          <div className="mb-16 max-w-4xl mx-auto">
            <div className="aspect-[21/9] md:aspect-[2.5/1] w-full relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 group">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${post.featureImage})` }}
              />
              <div className="absolute inset-0 border border-black/5 dark:border-white/10 rounded-3xl pointer-events-none" />
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="max-w-3xl mx-auto flex flex-col gap-16">
          
          {/* Article Body */}
          <article className="prose prose-lg md:prose-xl prose-slate dark:prose-invert max-w-none prose-headings:font-headline prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500 prose-img:rounded-2xl prose-img:shadow-xl prose-img:mx-auto prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-500/10 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300 prose-blockquote:font-medium prose-blockquote:not-italic prose-li:marker:text-indigo-500">
            <div dangerouslySetInnerHTML={{ __html: post.description || '' }} />
          </article>
          
          {/* Tags */}
          {tagsList.length > 0 && (
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tagsList.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <TagIcon className="w-3.5 h-3.5 mr-2 opacity-50" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Author Bio Box */}
          <div className="mt-8 bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-white dark:ring-slate-950">
              {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-center md:text-left flex-1">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Written By</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-headline mb-3">{post.authorName || 'Anonymous Editor'}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Content creator and educator at DeshExam. Passionate about helping students achieve their highest potential through clear, concise, and accurate learning materials.
              </p>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
