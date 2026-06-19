"use client";

import { useEffect, useState, useCallback } from "react";
import { FAQ, FAQFilters, FAQCategory } from "@/features/faqs/types/faq.types";
import { getFaqs, deleteFaq, bulkDeleteFaqs, getCategories } from "@/features/faqs/services/faq.api";
import { FAQFiltersBar } from "@/features/faqs/components/filters";
import { FAQTable } from "@/features/faqs/components/faq-table";
import { BulkImportDialog } from "@/features/faqs/components/bulk-import-dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, Settings } from "lucide-react";
import Link from "next/link";

export default function FAQManagePage() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FAQFilters>({ sortBy: "latest" });
  const [debouncedFilters, setDebouncedFilters] = useState<FAQFilters>(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters]);

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFaqs(debouncedFilters);
      setFaqs(data);
      setSelectedIds([]); // reset selection on fetch
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load FAQs." });
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, toast]);

  useEffect(() => {
    fetchFaqs();
    getCategories().then(setCategories).catch(console.error);
  }, [fetchFaqs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      // Optimistic update
      setFaqs(prev => prev.filter(f => f.id !== id));
      await deleteFaq(id);
      toast({ title: "Deleted", description: "FAQ removed successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete." });
      fetchFaqs(); // Revert
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} FAQs?`)) return;
    try {
      setLoading(true);
      await bulkDeleteFaqs(selectedIds);
      toast({ title: "Deleted", description: `${selectedIds.length} FAQs removed successfully.` });
      fetchFaqs();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to bulk delete." });
      setLoading(false);
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? faqs.map(f => f.id) : []);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">FAQ Management</h1>
          <p className="text-muted-foreground mt-1">Admin / FAQs</p>
        </div>
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected ({selectedIds.length})
            </Button>
          )}
          <BulkImportDialog categories={categories} onImportComplete={fetchFaqs} />
          <Link href="/admin/faqs/settings">
            <Button variant="outline">
              Settings
            </Button>
          </Link>
          <Link href="/admin/faqs/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" /> Create FAQ
            </Button>
          </Link>
        </div>
      </div>

      <FAQFiltersBar 
        filters={filters} 
        onFilterChange={(newFilters) => setFilters((prev: FAQFilters) => ({ ...prev, ...newFilters }))} 
      />

      <FAQTable 
        data={faqs} 
        loading={loading} 
        onDelete={handleDelete}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Mobile Floating Action Bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-full shadow-xl flex items-center justify-between px-6 py-3 z-40">
        <BulkImportDialog 
          categories={categories} 
          onImportComplete={fetchFaqs}
          trigger={
            <button className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
              <Upload className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-wide">Import</span>
            </button>
          }
        />
        
        <Link href="/admin/faqs/create" className="relative group">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white p-3.5 rounded-full shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-700 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1 mt-6 text-indigo-600 dark:text-indigo-400">
            <span className="text-[10px] font-bold tracking-wide">Create</span>
          </div>
        </Link>

        <Link href="/admin/faqs/settings" className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">Settings</span>
        </Link>
      </div>
    </div>
  );
}
