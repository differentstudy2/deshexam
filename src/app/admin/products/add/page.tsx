'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { createProduct } from '@/lib/firebase/product';
import { useToast } from '@/hooks/use-toast';
import { Book, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createProduct(data);
      toast({
        title: 'Success!',
        description: 'New product has been added to the store.',
      });
      router.push('/admin/products');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error adding product',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/admin/products" className="hover:text-foreground transition-colors">Products Store</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-foreground font-medium">Add New</span>
        </div>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Book className="w-8 h-8 text-green-600" />
          Add New Product
        </h1>
        <p className="text-muted-foreground">Create a new product listing for the storefront.</p>
      </div>

      <ProductForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
