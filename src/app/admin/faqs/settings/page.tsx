"use client";

import { useEffect, useState } from "react";
import { FAQCategory, FAQTag } from "@/features/faqs/types/faq.types";
import { getCategories, createCategory, deleteCategory, getTags, createTag, deleteTag } from "@/features/faqs/services/faq.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FAQSettingsPage() {
  const { toast } = useToast();
  
  // Category State
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Tag State
  const [tags, setTags] = useState<FAQTag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  const fetchData = async () => {
    try {
      setLoadingCategories(true);
      setLoadingTags(true);
      const [cats, tgs] = await Promise.all([getCategories(), getTags()]);
      setCategories(cats);
      setTags(tgs);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load taxonomy data." });
    } finally {
      setLoadingCategories(false);
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for Categories
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setIsAddingCat(true);
      const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const addedCat = await createCategory({ name: newCatName.trim(), slug });
      setCategories([...categories, addedCat]);
      setNewCatName("");
      toast({ title: "Success", description: "Category added successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add category." });
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleSeedCategories = async () => {
    if (!confirm("This will add standard categories like Mock Tests, Payments, etc. Proceed?")) return;
    const defaultCats = [
      { name: "General Queries", slug: "general" },
      { name: "Mock Tests & Practice", slug: "mock-tests" },
      { name: "Payments & Billing", slug: "payments" },
      { name: "Account Management", slug: "account" },
      { name: "Technical Support", slug: "technical" },
      { name: "Syllabus & Course Info", slug: "syllabus" }
    ];
    try {
      setIsAddingCat(true);
      for (const cat of defaultCats) {
        // Only add if it doesn't already exist
        if (!categories.find(c => c.slug === cat.slug)) {
          const added = await createCategory(cat);
          setCategories(prev => [...prev, added]);
        }
      }
      toast({ title: "Success", description: "Default categories added." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to seed categories." });
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? FAQs using it might lose their classification.")) return;
    try {
      setCategories(categories.filter(c => c.id !== id));
      await deleteCategory(id);
      toast({ title: "Deleted", description: "Category removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete category." });
      fetchData(); // Revert on fail
    }
  };

  // Handlers for Tags
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      setIsAddingTag(true);
      const addedTag = await createTag(newTagName.trim());
      setTags([...tags, addedTag]);
      setNewTagName("");
      toast({ title: "Success", description: "Tag added successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add tag." });
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    try {
      setTags(tags.filter(t => t.id !== id));
      await deleteTag(id);
      toast({ title: "Deleted", description: "Tag removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete tag." });
      fetchData(); // Revert on fail
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Taxonomy Management</h1>
        <p className="text-muted-foreground mt-1">Admin / FAQs / Settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage the main categories for your FAQs.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleSeedCategories} disabled={isAddingCat} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              Auto-Seed Default
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <Input 
                placeholder="New Category Name (e.g. Live Classes)" 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)}
                disabled={isAddingCat}
              />
              <Button type="submit" disabled={isAddingCat || !newCatName.trim()} className="shrink-0">
                {isAddingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add
              </Button>
            </form>

            <div className="rounded-md border bg-background overflow-hidden max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCategories ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No categories found.</TableCell></TableRow>
                  ) : (
                    categories.map(cat => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell><Badge variant="secondary" className="font-normal">{cat.slug}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)} className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Tags Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Manage fine-grained tags for your FAQs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddTag} className="flex gap-2">
              <Input 
                placeholder="New Tag Name (e.g. refund)" 
                value={newTagName} 
                onChange={(e) => setNewTagName(e.target.value)}
                disabled={isAddingTag}
              />
              <Button type="submit" disabled={isAddingTag || !newTagName.trim()} className="shrink-0">
                {isAddingTag ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add
              </Button>
            </form>

            <div className="rounded-md border bg-background overflow-hidden max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTags ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : tags.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground">No tags found.</TableCell></TableRow>
                  ) : (
                    tags.map(tag => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">{tag.name}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTag(tag.id)} className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
