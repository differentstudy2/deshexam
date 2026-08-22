'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/firebase/product';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function BookStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts({}, 50);
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-800 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <BookOpen className="w-16 h-16 mb-6 text-green-200" />
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight">
            DeshExam Store
          </h1>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mb-8">
            Discover our premium collection of textbooks, guides, and practice sets to ace your next exam.
          </p>
          
          <div className="w-full max-w-md relative text-slate-900">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
              type="text" 
              placeholder="Search by title or author..." 
              className="w-full pl-10 py-6 rounded-full border-0 shadow-lg text-lg focus-visible:ring-2 focus-visible:ring-green-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl h-96 shadow-sm"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-slate-600 dark:text-slate-400">No products found matching "{searchTerm}"</h2>
            <Button variant="outline" className="mt-4" onClick={() => setSearchTerm('')}>Clear Search</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Link href={`/book/${product.id}`} key={product.id} className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 dark:border-slate-800">
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={product.coverImage || '/placeholder.png'} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                      {product.discount}% OFF
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="secondary" className="bg-white/90 text-slate-800 backdrop-blur-sm hover:bg-white border-0 shadow-sm">
                      {product.bookType}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-1 text-xs font-semibold text-green-600 uppercase tracking-wider">{product.subject}</div>
                  <h3 className="font-bold text-lg mb-1 line-clamp-2 text-slate-900 dark:text-white group-hover:text-green-600 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
                    By {product.authorName}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-slate-900 dark:text-white">₹{product.price}</span>
                      {product.discount > 0 && (
                        <span className="text-sm text-slate-400 line-through ml-2">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <Button size="icon" className="rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
