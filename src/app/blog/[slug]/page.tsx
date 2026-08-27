import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/lib/firebase/firestore';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag as TagIcon, FolderTree } from 'lucide-react';
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

  // Very basic extraction of text from HTML for meta description
  const cleanDescription = post.description?.substring(0, 160).replace(/<[^>]*>?/gm, '') || 'Read this post on DeshExam.';

  return {
    title: `${post.title} - DeshExam Blog`,
    description: cleanDescription,
    openGraph: {
      images: post.featureImage ? [post.featureImage] : [],
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getContentBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const publishDate = post.publishedAt ? new Date(post.publishedAt) : new Date();
  
  const tagsList = post.tags && typeof post.tags === 'string' 
    ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean) 
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-body">
      {/* Premium Hero Section */}
      <div className="relative w-full h-[55vh] min-h-[450px] bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* Background Image with Dark Glass Overlay */}
        {post.featureImage ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center transform scale-105"
              style={{ backgroundImage: `url(${post.featureImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 backdrop-blur-[6px]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950" />
        )}
        
        {/* Hero Content */}
        <div className="relative z-10 container max-w-5xl mx-auto px-4 sm:px-6 pt-20">
          <Link href="/blog" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 group font-medium text-sm">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
          
          {post.category && (
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                <FolderTree className="w-3.5 h-3.5 mr-2" />
                {post.category}
              </span>
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight font-headline tracking-tight max-w-4xl drop-shadow-2xl">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 mt-10 text-slate-300 text-sm md:text-base border-t border-white/10 pt-6 max-w-4xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-semibold text-slate-200">{post.authorName || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{format(publishDate, 'MMMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-black/5 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 p-8 md:p-12 lg:p-16 min-h-[500px]">
          
          {/* Tags */}
          {tagsList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800/60">
              {tagsList.map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-default"
                >
                  <TagIcon className="w-3.5 h-3.5 mr-2 opacity-60" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Rich Text Content */}
          <article className="prose prose-slate prose-lg dark:prose-invert max-w-none prose-headings:font-headline prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500 prose-img:rounded-2xl prose-img:shadow-xl prose-img:mx-auto prose-blockquote:border-l-indigo-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg">
            <div dangerouslySetInnerHTML={{ __html: post.description || '' }} />
          </article>
          
        </div>
      </div>
    </div>
  );
}
