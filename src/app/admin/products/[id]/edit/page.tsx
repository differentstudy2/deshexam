'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { getProduct, updateProduct } from '@/lib/firebase/product';
import { useToast } from '@/hooks/use-toast';
import { Book, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/types';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const unwrappedParams = use(params);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(unwrappedParams.id);
        if (!data) {
          toast({ variant: 'destructive', title: 'Not Found', description: 'Product could not be found.' });
          router.push('/admin/products');
          return;
        }
        setProduct(data);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [unwrappedParams.id, router, toast]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await updateProduct(unwrappedParams.id, data);
      toast({
        title: 'Success!',
        description: 'Product details have been updated.',
      });
      router.push('/admin/products');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating product',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]">Loading Product...</div>;
  }

  if (!product) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/admin/products" className="hover:text-foreground transition-colors">Products Store</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
        </div>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Book className="w-8 h-8 text-green-600" />
          Edit Product
        </h1>
        <p className="text-muted-foreground">Update the details for this product listing.</p>
      </div>

      <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
