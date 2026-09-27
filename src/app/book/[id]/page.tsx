'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProduct } from '@/lib/firebase/product';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, ArrowLeft, Star, Share2, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(unwrappedParams.id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Product Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="w-full bg-green-600 hover:bg-green-700">
            <Link href="/book">Return to Store</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Breadcrumb & Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/book" className="flex items-center text-slate-500 hover:text-green-600 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-green-600">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Product Images (Left) */}
          <div className="w-full lg:w-5/12 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-transparent dark:from-green-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative w-full max-w-sm aspect-[3/4] rounded-lg shadow-2xl overflow-hidden transform group-hover:scale-105 transition-transform duration-500 shadow-slate-300 dark:shadow-slate-950/50">
                  <img 
                    src={product.coverImage || '/placeholder.png'} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-md shadow-lg shadow-red-500/30">
                      Save {product.discount}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details (Right) */}
          <div className="w-full lg:w-7/12 flex flex-col">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
                {product.subject}
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900">
                {product.classCategory}
              </Badge>
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900">
                {product.bookType}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight font-headline">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6 text-sm">
              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <span className="text-slate-500 mr-2">By</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{product.authorName}</span>
              </div>
              {product.authorBusinessName && (
                <>
                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  <div className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">{product.authorBusinessName}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-5 h-5 ${star <= (product.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
              ))}
              <span className="text-slate-500 ml-2 text-sm">({product.reviewCount || 0} reviews)</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
              <div className="flex flex-col gap-1 mb-6">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Price</span>
                <div className="flex items-end gap-3">
                  <span className="text-4xl md:text-5xl font-bold text-green-600 tracking-tight">₹{product.price}</span>
                  {product.discount > 0 && (
                    <span className="text-xl text-slate-400 line-through mb-1">₹{product.originalPrice}</span>
                  )}
                </div>
                <span className="text-sm text-slate-500 mt-1">Inclusive of all taxes</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 h-14 text-lg rounded-xl">
                  Buy Now
                </Button>
                <Button variant="outline" className="flex-1 h-14 text-lg rounded-xl border-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  Add to Cart
                </Button>
              </div>

              <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Instant digital access (if soft copy)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Secure checkout process</span>
                </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <Layers className="w-5 h-5 text-green-600" />
                Description
              </h3>
              <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {product.description || "No detailed description available for this product."}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8 bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl">
                <div>
                  <span className="block text-sm text-slate-500 mb-1">Language</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">{product.language}</span>
                </div>
                <div>
                  <span className="block text-sm text-slate-500 mb-1">Published</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">{product.publishedDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-sm text-slate-500 mb-1">Downloads / Sales</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {product.bookType === 'Soft Copy' ? product.downloads || 0 : product.sales || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
