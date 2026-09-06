'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Loader2, Upload, Copy, Download, FileText, CheckCircle, 
  ShieldCheck, Languages, FileType, ImagePlus, ArrowRight, 
  BookOpen, GraduationCap, Building, Smartphone, Printer, Cpu,
  FileImage, FileDown, Type, CheckSquare, Clock, X
} from 'lucide-react';
import Link from 'next/link';

export function TextExtractorUI() {
  const [files, setFiles] = useState<{file: File, preview: string | null}[]>([]);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => ({
        file: f,
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null
      }));
      setFiles(prev => [...prev, ...newFiles]);
      setExtractedText('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => validTypes.includes(f.type) || f.name.endsWith('.pdf'));
      
      if (droppedFiles.length > 0) {
        const newFiles = droppedFiles.map(f => ({
          file: f,
          preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null
        }));
        setFiles(prev => [...prev, ...newFiles]);
        setExtractedText('');
      } else {
        alert('Please upload valid PDF or Image files.');
      }
    }
  };

  const extractText = async () => {
    if (files.length === 0) return;
    setIsExtracting(true);
    setExtractedText('');

    try {
      let combinedText = '';
      for (const item of files) {
        const pageDataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(item.file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });

        const { solvedTextbookPageAssistant } = await import('@/ai/flows/solved-textbook-page-assistant');
        const result = await solvedTextbookPageAssistant({ pageDataUri });

        if (result && result.content) {
          combinedText += (files.length > 1 ? `\n\n--- Extracted from ${item.file.name} ---\n\n` : '') + result.content + '\n';
        }
      }

      if (!combinedText) {
        throw new Error('Failed to generate text from the document(s).');
      }

      setExtractedText(combinedText.trim());
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred during extraction.');
    } finally {
      setIsExtracting(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      alert('Copied to clipboard!');
    }
  };

  const downloadText = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pb-24">
      
      {/* 1. Tool Navigation Header */}
      <div className="flex flex-wrap justify-center gap-4 mt-8 pb-8 border-b border-border/40">
        {[
          { name: 'Image to Text', icon: <FileImage className="w-4 h-4 mr-2" />, active: true },
          { name: 'PDF to Text', icon: <FileType className="w-4 h-4 mr-2" /> },
          { name: 'Image to Word', icon: <FileDown className="w-4 h-4 mr-2" /> },
          { name: 'PDF to Word', icon: <FileDown className="w-4 h-4 mr-2" /> },
          { name: 'Text to Handwriting', icon: <Type className="w-4 h-4 mr-2" /> },
        ].map((tool, idx) => (
          <Button 
            key={idx} 
            variant={tool.active ? "default" : "outline"}
            className="rounded-full bg-white/50 dark:bg-slate-900/50 hover:bg-primary/10 transition-colors"
          >
            {tool.icon}
            {tool.name}
          </Button>
        ))}
      </div>

      {/* 2. Hero & Core Extractor UI */}
      <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Image to Text Converter
        </h1>
        <p className="text-lg text-muted-foreground">
          Extract text from images, scanned documents, and PDFs instantly with high accuracy. 
          Upload your file below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Upload className="w-5 h-5 mr-2 text-primary" />
              Upload Document
            </CardTitle>
            <CardDescription>Drag & drop or click to select (JPG, PNG, WEBP, PDF)</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                files.length > 0 
                  ? 'border-primary bg-primary/5 shadow-inner' 
                  : 'border-border/60 hover:bg-primary/5 hover:border-primary/40'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg, image/png, image/webp, application/pdf"
                onChange={handleFileChange}
              />
              
              {!files.length ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full shadow-sm animate-pulse">
                    <ImagePlus className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-primary">Click to upload</p>
                    <p className="text-sm text-muted-foreground mt-1">or drag and drop multiple files here</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {files.map((f, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/20 group">
                        {f.preview ? (
                          <img src={f.preview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <FileText className="w-8 h-8 text-primary" />
                          </div>
                        )}
                        <button 
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles(prev => prev.filter((_, idx) => idx !== i));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold truncate max-w-[200px]">{files.length} file(s) selected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click or drag to add more
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button 
                onClick={extractText} 
                disabled={files.length === 0 || isExtracting}
                className="w-full font-semibold shadow-md hover:shadow-lg transition-all h-12 text-lg"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Extracting Text...
                  </>
                ) : (
                  'Extract Text'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full min-h-[500px] border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/30">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center">
                <Type className="w-5 h-5 mr-2 text-primary" />
                Extracted Text Result
              </CardTitle>
            </div>
            {extractedText && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-9 px-3 hover:bg-primary/10 hover:text-primary">
                  <Copy className="w-4 h-4 mr-2" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadText} className="h-9 px-3 hover:bg-primary/10 hover:text-primary">
                  <Download className="w-4 h-4 mr-2" /> Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0 relative">
            {isExtracting && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="font-medium animate-pulse">Analyzing document...</p>
              </div>
            )}
            <Textarea
              className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 p-6 text-base leading-relaxed bg-transparent"
              placeholder={isExtracting ? '' : 'Extracted text will appear here...'}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              readOnly={isExtracting}
            />
          </CardContent>
        </Card>
      </div>

      {/* 3. How does it work */}
      <section className="pt-12">
        <h2 className="text-3xl font-bold text-center mb-10">How does image to text converter work?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
          {[
            { step: '1', title: 'Upload Image', desc: 'Drag and drop your image, PDF, or screenshot into the upload box.' },
            { step: '2', title: 'Click Extract', desc: 'Our advanced AI reads the document and extracts the text with high accuracy.' },
            { step: '3', title: 'Copy & Save', desc: 'Review the text, edit if needed, and copy it to clipboard or download as .txt.' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-muted/20 border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Features */}
      <section className="pt-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Features of our Text Extractor</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to convert images to text effortlessly.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <CheckCircle className="w-8 h-8 text-green-500" />, title: 'Free to use', desc: 'Convert unlimited images to text without paying anything.' },
            { icon: <ShieldCheck className="w-8 h-8 text-blue-500" />, title: 'Secure & Reliable', desc: 'Your files are processed securely and deleted automatically.' },
            { icon: <Languages className="w-8 h-8 text-purple-500" />, title: 'Multiple Languages', desc: 'Accurately recognizes English, Bengali, and many other languages.' },
            { icon: <FileType className="w-8 h-8 text-orange-500" />, title: 'Extract from PDF', desc: 'Not just images! Upload scanned PDFs to get text easily.' },
            { icon: <ImagePlus className="w-8 h-8 text-pink-500" />, title: 'Multiple Formats', desc: 'Supports JPG, PNG, WEBP, and more standard image formats.' },
            { icon: <Clock className="w-8 h-8 text-teal-500" />, title: 'Fast Processing', desc: 'Get your extracted text in seconds with our optimized AI.' },
          ].map((feat, i) => (
            <Card key={i} className="border-border/40 hover:border-primary/30 hover:shadow-md transition-all">
              <CardHeader>
                <div className="mb-4 bg-muted/50 w-fit p-3 rounded-lg">{feat.icon}</div>
                <CardTitle>{feat.title}</CardTitle>
                <CardDescription className="text-base">{feat.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Flow Diagram */}
      <section className="py-16 bg-muted/10 rounded-3xl border border-border/40">
        <h2 className="text-2xl font-bold text-center mb-12">Simple Extraction Process</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border/50 w-full md:w-48">
            <ImagePlus className="w-10 h-10 text-primary mb-3" />
            <span className="font-semibold">Input Image</span>
          </div>
          <ArrowRight className="w-8 h-8 text-muted-foreground hidden md:block rotate-90 md:rotate-0" />
          <div className="flex flex-col items-center text-center p-6 bg-primary/10 rounded-xl border border-primary/20 w-full md:w-56 shadow-sm">
            <Cpu className="w-10 h-10 text-primary mb-3" />
            <span className="font-semibold text-primary">AI Processing</span>
          </div>
          <ArrowRight className="w-8 h-8 text-muted-foreground hidden md:block rotate-90 md:rotate-0" />
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border/50 w-full md:w-48">
            <FileText className="w-10 h-10 text-green-500 mb-3" />
            <span className="font-semibold">Extracted Text</span>
          </div>
        </div>
      </section>

      {/* 6. Use Cases */}
      <section className="pt-8">
        <h2 className="text-3xl font-bold text-center mb-10">Where can you use a photo to text converter?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <BookOpen className="w-6 h-6" />, title: 'Books & Papers', desc: 'Digitize textbook pages and notes.' },
            { icon: <CheckSquare className="w-6 h-6" />, title: 'Data Entry', desc: 'Quickly extract text from forms and tables.' },
            { icon: <GraduationCap className="w-6 h-6" />, title: 'Education', desc: 'Copy text from lecture slides and assignments.' },
            { icon: <Building className="w-6 h-6" />, title: 'Office Work', desc: 'Scan and extract info from business cards.' },
            { icon: <Printer className="w-6 h-6" />, title: 'Receipts', desc: 'Digitize your printed receipts for accounting.' },
            { icon: <Smartphone className="w-6 h-6" />, title: 'Social Media', desc: 'Extract quotes and text from memes or screenshots.' },
          ].map((useCase, i) => (
            <div key={i} className="flex flex-col p-6 rounded-2xl bg-card border border-border/50 hover:shadow-md transition-shadow">
              <div className="mb-4 text-primary bg-primary/10 w-fit p-3 rounded-lg">
                {useCase.icon}
              </div>
              <h3 className="font-semibold mb-2">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQs */}
      <section className="max-w-3xl mx-auto pt-12">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg">What is an image to text converter?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              An image to text converter uses OCR (Optical Character Recognition) and AI to analyze an image, identify the letters and words, and convert them into editable digital text.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg">How to extract text from an image?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Simply drag and drop your image into the upload box on this page, or click to select a file. Then click "Extract Text" and our AI will do the rest in seconds.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg">Is my data secure?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Yes, absolutely. We do not store your uploaded images or the extracted text on our servers. All processing is done securely and data is discarded immediately after extraction.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg">Does it support handwriting?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Yes, our advanced AI model is capable of recognizing and transcribing clear handwritten notes, though accuracy is always highest with printed text.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 8. Related Tools */}
      <section className="pt-12 border-t border-border/40 mt-12">
        <h2 className="text-2xl font-bold mb-8">Related Tools</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/tools/text-extractor">
            <Card className="hover:border-primary/50 cursor-pointer transition-all w-64">
              <CardContent className="p-4 flex items-center">
                <FileType className="w-8 h-8 text-blue-500 mr-4" />
                <div>
                  <h4 className="font-semibold">PDF to Text</h4>
                  <p className="text-xs text-muted-foreground">Extract text from PDF</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tools/text-extractor">
            <Card className="hover:border-primary/50 cursor-pointer transition-all w-64">
              <CardContent className="p-4 flex items-center">
                <Type className="w-8 h-8 text-indigo-500 mr-4" />
                <div>
                  <h4 className="font-semibold">Text to Handwriting</h4>
                  <p className="text-xs text-muted-foreground">Convert text to custom font</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tools/text-extractor">
            <Card className="hover:border-primary/50 cursor-pointer transition-all w-64">
              <CardContent className="p-4 flex items-center">
                <FileImage className="w-8 h-8 text-orange-500 mr-4" />
                <div>
                  <h4 className="font-semibold">Image to PDF</h4>
                  <p className="text-xs text-muted-foreground">Convert JPG/PNG to PDF</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

    </div>
  );
}
