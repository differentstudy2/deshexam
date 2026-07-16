'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Copy, Download, FileText, Image as ImageIcon } from 'lucide-react';

export function TextExtractorUI() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
      setExtractedText('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (validTypes.includes(droppedFile.type) || droppedFile.name.endsWith('.pdf')) {
        setFile(droppedFile);
        if (droppedFile.type.startsWith('image/')) {
          setPreviewUrl(URL.createObjectURL(droppedFile));
        } else {
          setPreviewUrl(null);
        }
        setExtractedText('');
      } else {
        alert('Please upload a valid PDF or Image file.');
      }
    }
  };

  const extractText = async () => {
    if (!file) return;
    
    setIsExtracting(true);
    setExtractedText('');

    try {
      // Convert file to Data URI
      const pageDataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      // Call the existing Genkit server action
      const { solvedTextbookPageAssistant } = await import('@/ai/flows/solved-textbook-page-assistant');
      const result = await solvedTextbookPageAssistant({ pageDataUri });

      if (!result || !result.content) {
        throw new Error('Failed to generate text from the document.');
      }

      setExtractedText(result.content);
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
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Image & PDF Text Extractor</h1>
        <p className="text-muted-foreground">
          Upload an image or PDF to instantly extract its text using highly accurate OCR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Upload className="w-5 h-5 mr-2 text-primary" />
              Upload Document
            </CardTitle>
            <CardDescription>Supported formats: JPG, PNG, WEBP, PDF.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                file 
                  ? 'border-primary/50 bg-primary/5 shadow-inner' 
                  : 'border-border/60 hover:bg-muted/50 hover:border-primary/30'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg, image/png, image/webp, application/pdf"
                onChange={handleFileChange}
              />
              
              {!file ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full shadow-sm">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  {previewUrl ? (
                    <div className="relative w-full max-w-[200px] rounded-lg overflow-hidden border shadow-sm group">
                      <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover transition-transform group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="p-4 bg-primary/10 rounded-full shadow-sm">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium line-clamp-1">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={extractText} 
                disabled={!file || isExtracting}
                className="w-full md:w-auto font-medium shadow-sm transition-all"
                size="lg"
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

        {/* Result Section */}
        <Card className="flex flex-col h-full min-h-[450px] border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30 bg-muted/20">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Extracted Text
              </CardTitle>
              <CardDescription>
                {extractedText ? 'Review and copy your text below.' : 'Text will appear here.'}
              </CardDescription>
            </div>
            {extractedText && (
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy to clipboard" className="h-9 w-9">
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="outline" size="icon" onClick={downloadText} title="Download as .txt" className="h-9 w-9">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0 relative">
            {isExtracting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            <Textarea
              className="w-full h-[300px] md:h-full min-h-[350px] resize-none border-0 focus-visible:ring-0 p-6 text-base leading-relaxed bg-transparent"
              placeholder={isExtracting ? 'Processing your document...' : 'Extracted text will appear here...'}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              readOnly={isExtracting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
