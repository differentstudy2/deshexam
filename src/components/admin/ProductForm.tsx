'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getSubjects, getClasses } from '@/lib/firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type MetafieldItem = { id: string, name: string };

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading = false }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [subjects, setSubjects] = useState<MetafieldItem[]>([]);
  const [classes, setClasses] = useState<MetafieldItem[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    title: initialData?.title || '',
    authorName: initialData?.authorName || '',
    authorBusinessName: initialData?.authorBusinessName || '',
    originalPrice: initialData?.originalPrice || 0,
    price: initialData?.price || 0,
    bookType: initialData?.bookType || 'Soft Copy',
    language: initialData?.language || 'Bangla',
    classCategory: initialData?.classCategory || '',
    subject: initialData?.subject || '',
    description: initialData?.description || '',
    coverImage: initialData?.coverImage || '',
    rating: initialData?.rating || 0,
    reviewCount: initialData?.reviewCount || 0,
    sales: initialData?.sales || 0,
    downloads: initialData?.downloads || 0,
    publishedDate: initialData?.publishedDate || new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchTaxonomies = async () => {
      try {
        const [subs, cls] = await Promise.all([getSubjects(), getClasses()]);
        
        // Deduplicate by name to prevent Radix UI Select duplicate key errors
        const uniqueSubs = Array.from(new Map(subs.map(s => [s.name, s])).values());
        const uniqueCls = Array.from(new Map(cls.map(c => [c.name, c])).values());
        
        setSubjects(uniqueSubs);
        setClasses(uniqueCls);
      } catch (err) {
        console.error("Failed to load taxonomies", err);
      }
    };
    fetchTaxonomies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<Product>) => ({ 
      ...prev, 
      [name]: name === 'price' || name === 'originalPrice' ? Number(value) : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: Partial<Product>) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `books/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData((prev: Partial<Product>) => ({ ...prev, coverImage: downloadURL }));
      toast({ title: 'Image uploaded successfully' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.coverImage || !formData.subject || !formData.classCategory) {
      toast({ variant: 'destructive', title: 'Missing required fields' });
      return;
    }

    const discount = formData.originalPrice && formData.originalPrice > 0 
      ? Math.round(((formData.originalPrice - (formData.price || 0)) / formData.originalPrice) * 100) 
      : 0;

    await onSubmit({
      title: formData.title as string,
      authorName: formData.authorName as string,
      authorBusinessName: formData.authorBusinessName as string,
      price: formData.price as number,
      originalPrice: formData.originalPrice as number,
      discount: discount > 0 ? discount : 0,
      bookType: formData.bookType as 'Hard Copy' | 'Soft Copy',
      language: formData.language as string,
      classCategory: formData.classCategory as string,
      subject: formData.subject as string,
      description: formData.description as string,
      coverImage: formData.coverImage as string,
      rating: formData.rating || 0,
      reviewCount: formData.reviewCount || 0,
      sales: formData.sales || 0,
      downloads: formData.downloads || 0,
      publishedDate: formData.publishedDate as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Book Title *</Label>
                <Input name="title" value={formData.title} onChange={handleChange} placeholder="Enter book title" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Author Name *</Label>
                  <Input name="authorName" value={formData.authorName} onChange={handleChange} placeholder="e.g. John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label>Author Business/Brand Name</Label>
                  <Input name="authorBusinessName" value={formData.authorBusinessName} onChange={handleChange} placeholder="e.g. DeshExam" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter book description..." rows={5} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-2">Categorization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class Category *</Label>
                  <Select value={formData.classCategory} onValueChange={(val) => handleSelectChange('classCategory', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={formData.subject} onValueChange={(val) => handleSelectChange('subject', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Book Type</Label>
                  <Select value={formData.bookType} onValueChange={(val) => handleSelectChange('bookType', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soft Copy">Soft Copy (PDF)</SelectItem>
                      <SelectItem value="Hard Copy">Hard Copy (Physical)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={formData.language} onValueChange={(val) => handleSelectChange('language', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bangla">Bangla</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-2">Cover Image *</h3>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900 relative">
                {formData.coverImage ? (
                  <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden">
                    <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center text-slate-400">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm">No image selected</span>
                  </div>
                )}
                
                <div className="mt-4 w-full">
                  <Label htmlFor="cover-upload" className="w-full">
                    <div className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-center py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center justify-center">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {uploadingImage ? 'Uploading...' : formData.coverImage ? 'Change Image' : 'Upload Image'}
                    </div>
                  </Label>
                  <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-2">Pricing</h3>
              <div className="space-y-2">
                <Label>Original Price (₹)</Label>
                <Input name="originalPrice" type="number" min="0" value={formData.originalPrice} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Current Selling Price (₹)</Label>
                <Input name="price" type="number" min="0" value={formData.price} onChange={handleChange} required />
                <p className="text-xs text-muted-foreground mt-1">Discount percentage is calculated automatically.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading || uploadingImage}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {initialData ? 'Update Book' : 'Save Book'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
