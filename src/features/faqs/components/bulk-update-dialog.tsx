"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit3, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FAQCategory, FAQStatus, UpdateFAQDTO } from "../types/faq.types";
import { bulkUpdateFaqs } from "../services/faq.api";

interface BulkUpdateDialogProps {
  selectedIds: string[];
  categories: FAQCategory[];
  onUpdateComplete: () => void;
  trigger?: React.ReactNode;
}

export const BulkUpdateDialog = ({ selectedIds, categories, onUpdateComplete, trigger }: BulkUpdateDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Field selection toggles
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateCategory, setUpdateCategory] = useState(false);
  const [updateViews, setUpdateViews] = useState(false);
  const [updateHelpful, setUpdateHelpful] = useState(false);

  // Field values
  const [status, setStatus] = useState<FAQStatus | "">("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [views, setViews] = useState<number>(0);
  const [helpfulVotes, setHelpfulVotes] = useState<number>(0);

  const handleUpdate = async () => {
    if (selectedIds.length === 0) return;

    const data: UpdateFAQDTO = {};
    if (updateStatus && status) data.status = status as FAQStatus;
    if (updateCategory && categoryId) data.categoryId = categoryId;
    if (updateViews) data.views = views;
    if (updateHelpful) data.helpfulVotes = helpfulVotes;

    if (Object.keys(data).length === 0) {
      toast({ variant: "destructive", title: "No fields selected", description: "Please select and configure at least one field to update." });
      return;
    }

    try {
      setIsUpdating(true);
      await bulkUpdateFaqs(selectedIds, data);
      toast({ title: "Update Successful", description: `Successfully updated ${selectedIds.length} FAQs.` });
      setOpen(false);
      
      // Reset state
      setUpdateStatus(false);
      setUpdateCategory(false);
      setUpdateViews(false);
      setUpdateHelpful(false);
      setStatus("");
      setCategoryId("");
      setViews(0);
      setHelpfulVotes(0);

      onUpdateComplete();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message || "An error occurred during bulk update." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/50">
            <Edit3 className="w-4 h-4 mr-2" /> Bulk Edit ({selectedIds.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Update FAQs</DialogTitle>
          <DialogDescription>
            Select the fields you want to update for the {selectedIds.length} selected FAQs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Status */}
          <div className="flex items-center gap-4">
            <Checkbox 
              id="chk-status" 
              checked={updateStatus} 
              onCheckedChange={(c) => setUpdateStatus(c as boolean)} 
            />
            <div className="flex-1 space-y-1">
              <label htmlFor="chk-status" className="text-sm font-medium leading-none cursor-pointer">Update Status</label>
              {updateStatus && (
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center gap-4">
            <Checkbox 
              id="chk-cat" 
              checked={updateCategory} 
              onCheckedChange={(c) => setUpdateCategory(c as boolean)} 
            />
            <div className="flex-1 space-y-1">
              <label htmlFor="chk-cat" className="text-sm font-medium leading-none cursor-pointer">Update Category</label>
              {updateCategory && (
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select new category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Views */}
          <div className="flex items-center gap-4">
            <Checkbox 
              id="chk-views" 
              checked={updateViews} 
              onCheckedChange={(c) => setUpdateViews(c as boolean)} 
            />
            <div className="flex-1 space-y-1">
              <label htmlFor="chk-views" className="text-sm font-medium leading-none cursor-pointer">Add Views Count</label>
              {updateViews && (
                <Input 
                  type="number" 
                  className="mt-2" 
                  value={views} 
                  onChange={(e) => setViews(Number(e.target.value))} 
                />
              )}
            </div>
          </div>

          {/* Helpful */}
          <div className="flex items-center gap-4">
            <Checkbox 
              id="chk-helpful" 
              checked={updateHelpful} 
              onCheckedChange={(c) => setUpdateHelpful(c as boolean)} 
            />
            <div className="flex-1 space-y-1">
              <label htmlFor="chk-helpful" className="text-sm font-medium leading-none cursor-pointer">Add Helpful Votes</label>
              {updateHelpful && (
                <Input 
                  type="number" 
                  className="mt-2" 
                  value={helpfulVotes} 
                  onChange={(e) => setHelpfulVotes(Number(e.target.value))} 
                />
              )}
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUpdating}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={isUpdating || (!updateStatus && !updateCategory && !updateViews && !updateHelpful)}>
            {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit3 className="w-4 h-4 mr-2" />}
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
