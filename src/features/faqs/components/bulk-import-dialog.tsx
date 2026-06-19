"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, FileJson, Loader2, Download } from "lucide-react";
import Papa from "papaparse";
import { bulkCreateFaqs } from "../services/faq.api";
import { CreateFAQDTO, FAQCategory } from "../types/faq.types";

interface BulkImportDialogProps {
  categories: FAQCategory[];
  onImportComplete: () => void;
}

export function BulkImportDialog({ categories, onImportComplete }: BulkImportDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Question,Answer,Category Slug,Tags\n\"What is Pass Pro?\",\"Pass Pro is our premium subscription.\",\"subscription\",\"pricing, subscription\"\n\"How to login?\",\"Go to the login page.\",\"account\",\"login\"";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "faq_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJsonTemplate = () => {
    const jsonContent = [
      {
        question: "What is Pass Pro?",
        answer: "Pass Pro is our premium subscription.",
        categoryId: "subscription",
        tags: "pricing, subscription"
      }
    ];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonContent, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "faq_import_template.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      let parsedFaqs: any[] = [];

      if (fileExt === 'json') {
        const text = await file.text();
        parsedFaqs = JSON.parse(text);
        if (!Array.isArray(parsedFaqs)) throw new Error("JSON file must contain an array of FAQs.");
      } else if (fileExt === 'csv') {
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (result.errors.length) throw new Error("Error parsing CSV file.");
        
        parsedFaqs = result.data.map((row: any) => ({
          question: row["Question"] || row["question"],
          answer: row["Answer"] || row["answer"],
          categoryId: row["Category Slug"] || row["Category"] || row["categoryId"],
          tags: row["Tags"] || row["tags"] || ""
        }));
      } else {
        throw new Error("Unsupported file format. Please upload CSV or JSON.");
      }

      // Transform and validate
      const validFaqs: CreateFAQDTO[] = parsedFaqs.map(row => {
        if (!row.question || !row.answer) {
          throw new Error("Missing required fields (Question, Answer) in one or more rows.");
        }
        
        let catId = row.categoryId?.trim().toLowerCase() || "general";
        // Attempt to find matching category by slug or ID
        const matchedCat = categories.find(c => c.slug === catId || c.id === catId);
        if (!matchedCat) catId = "general";

        const tagsArray = typeof row.tags === 'string' 
            ? row.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : (Array.isArray(row.tags) ? row.tags : []);

        const baseSlug = row.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        return {
          question: row.question,
          answer: row.answer,
          categoryId: catId,
          tags: tagsArray,
          status: "published",
          order: 0,
          featured: false,
          seo: {
            slug: baseSlug,
            schemaEnabled: true
          }
        };
      });

      await bulkCreateFaqs(validFaqs);
      toast({ title: "Import Successful", description: `Successfully imported ${validFaqs.length} FAQs.` });
      setIsOpen(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onImportComplete();
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "Import Failed", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Import FAQs</DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file to mass-import FAQs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col gap-3 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <Label className="text-sm font-semibold">Download Templates</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadCsvTemplate} className="w-full">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                CSV Template
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadJsonTemplate} className="w-full">
                <FileJson className="w-4 h-4 mr-2 text-amber-500" />
                JSON Template
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload File (.csv, .json)</Label>
            <Input 
              id="file-upload" 
              type="file" 
              accept=".csv,.json,application/json,text/csv" 
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="text-xs text-muted-foreground mt-2">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleImport} disabled={!file || isProcessing} className="bg-indigo-600 hover:bg-indigo-700">
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Start Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
