'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Upload, ImageIcon, Sparkles, Trash2, Link as LinkIcon } from 'lucide-react';
import { uploadFile } from '@/lib/firebase/firestore';
import { generateImage } from '@/ai/flows/ai-image-generator';
import Image from 'next/image';

export const ImageUploader = ({ 
    fieldName = "image", 
    onUrlChange, 
    value, 
    defaultAiPrompt,
    label = "Feature Image",
    multiple = false
}: { 
    fieldName?: string, 
    onUrlChange: (url: any) => void, 
    value?: string | string[], 
    defaultAiPrompt?: string,
    label?: string,
    multiple?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');
    const [url, setUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState(defaultAiPrompt || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derive array of images for consistent rendering
    const images: string[] = value ? (Array.isArray(value) ? value : [value]) : [];

    useEffect(() => {
        if (defaultAiPrompt) {
            setPrompt(defaultAiPrompt);
        }
    }, [defaultAiPrompt]);

    const handleAddImage = (newUrl: string) => {
        if (multiple) {
            onUrlChange([...images, newUrl]);
        } else {
            onUrlChange(newUrl);
        }
        setIsOpen(false);
    };

    const handleRemoveImage = (index: number) => {
        if (multiple) {
            const newImages = [...images];
            newImages.splice(index, 1);
            onUrlChange(newImages);
        } else {
            onUrlChange('');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const downloadURL = await uploadFile(file);
                handleAddImage(downloadURL);
            } catch (error) {
                console.error("Upload error:", error);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };
    
    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        try {
            const result = await generateImage({ prompt });
            handleAddImage(result.imageUrl);
        } catch (error) {
            console.error("AI Generation error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const openDialog = (tab: string) => {
        setActiveTab(tab);
        setIsOpen(true);
    };

    // Extract filename from URL or use a placeholder
    const getFileName = (urlStr: string) => {
        if (!urlStr) return "No file chosen";
        try {
            const decoded = decodeURIComponent(urlStr);
            const segments = decoded.split('/');
            const lastSegment = segments[segments.length - 1];
            const nameWithQuery = lastSegment.split('?')[0];
            return nameWithQuery || "Image file";
        } catch {
            return "Image file";
        }
    };

    const lastImage = images.length > 0 ? images[images.length - 1] : '';

    return (
        <div className="space-y-4 p-5 border rounded-xl bg-white dark:bg-slate-950 shadow-sm w-full">
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
                <ImageIcon className="w-6 h-6 text-slate-500" />
                {label}
            </div>

            {/* Image Preview Area */}
            {images.length > 0 && (
                <div className="grid gap-4 mt-4">
                    {images.map((img, i) => (
                        <div key={i} className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group shadow-inner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg h-10 w-10 shadow-lg"
                                onClick={() => handleRemoveImage(i)}
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <Button variant="outline" className="w-full h-12 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-base font-semibold border-slate-200 dark:border-slate-800" onClick={() => openDialog('upload')}>
                    <Upload className="w-5 h-5 mr-2" /> Upload
                </Button>
                <Button variant="outline" className="w-full h-12 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-base font-semibold border-slate-200 dark:border-slate-800" onClick={() => openDialog('url')}>
                    <LinkIcon className="w-5 h-5 mr-2" /> URL
                </Button>
                <Button variant="outline" className="w-full h-12 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 text-base font-semibold border-purple-100 dark:border-purple-900/50" onClick={() => openDialog('ai')}>
                    <Sparkles className="w-5 h-5 mr-2" /> AI Generate
                </Button>
            </div>

            {/* Selected File Name / Status */}
            <div className="flex items-center gap-4 p-3.5 border rounded-lg bg-white dark:bg-slate-950 mt-4">
                <span className="font-bold text-sm whitespace-nowrap">Choose File</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 truncate font-medium">
                    {images.length === 0 ? "No file chosen" : (multiple ? `${images.length} file(s) selected` : getFileName(lastImage))}
                </span>
            </div>

            {/* Dialog for Uploads */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Set Image</DialogTitle>
                    </DialogHeader>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="upload">Upload</TabsTrigger>
                            <TabsTrigger value="url">From URL</TabsTrigger>
                            <TabsTrigger value="ai">Generate with AI</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="pt-4">
                            <div 
                                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                    <p className="text-sm font-medium">Click to upload a file</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                            <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
                            {isUploading && <div className="mt-4 flex items-center justify-center text-sm font-medium"><Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> Uploading image...</div>}
                        </TabsContent>
                        <TabsContent value="url" className="pt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input id="imageUrl" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/image.png" />
                            </div>
                            <Button type="button" onClick={() => handleAddImage(url)} className="w-full">Set URL</Button>
                        </TabsContent>
                        <TabsContent value="ai" className="pt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="aiPrompt">Image Prompt</Label>
                                <textarea 
                                    id="aiPrompt" 
                                    value={prompt} 
                                    onChange={(e) => setPrompt(e.target.value)} 
                                    placeholder="e.g., A majestic dragon soaring" 
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[200px]"
                                />
                            </div>
                            <Button type="button" onClick={handleGenerate} disabled={isGenerating} className="w-full">
                                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Image...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Image</>}
                            </Button>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
};
