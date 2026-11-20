'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  subject?: string;
  content: string;
  createdAt: any;
}

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'email' as const,
    subject: '',
    content: '',
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Template[];
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({ title: 'Error', description: 'Name and content are required', variant: 'destructive' });
      return;
    }

    if (newTemplate.type === 'email' && !newTemplate.subject) {
      toast({ title: 'Error', description: 'Email templates require a subject', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'templates'), {
        ...newTemplate,
        createdAt: serverTimestamp()
      });
      toast({ title: 'Success', description: 'Template created successfully' });
      setNewTemplate({ name: '', type: 'email', subject: '', content: '' });
      fetchTemplates();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await deleteDoc(doc(db, 'templates', id));
      toast({ title: 'Deleted', description: 'Template has been removed' });
      fetchTemplates();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8 text-emerald-600" />
          Message Templates
        </h1>
        <p className="text-slate-500 mt-2">Manage reusable templates for Emails, SMS, and Push Notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Template</CardTitle>
              <CardDescription>Add a new reusable message template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input 
                  value={newTemplate.name}
                  onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="e.g. Welcome Email"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newTemplate.type}
                  onChange={e => setNewTemplate({...newTemplate, type: e.target.value as any})}
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push Notification</option>
                </select>
              </div>
              
              {newTemplate.type === 'email' && (
                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input 
                    value={newTemplate.subject}
                    onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})}
                    placeholder="e.g. Welcome to DeshExam!"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea 
                  value={newTemplate.content}
                  onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
                  placeholder="Enter the template content. Use {{name}} for variables."
                  rows={6}
                />
              </div>
              <Button onClick={handleCreate} disabled={isSubmitting} className="w-full mt-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Template
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Saved Templates</CardTitle>
              <CardDescription>Your existing message templates</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-slate-500 animate-pulse">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                  <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>No templates found.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map(tpl => (
                        <TableRow key={tpl.id}>
                          <TableCell>
                            <Badge variant={
                              tpl.type === 'email' ? 'default' : 
                              tpl.type === 'sms' ? 'secondary' : 'outline'
                            } className="uppercase">
                              {tpl.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{tpl.name}</div>
                            {tpl.subject && <div className="text-xs text-slate-500 font-mono mt-1">Subj: {tpl.subject}</div>}
                            <div className="text-sm text-slate-500 line-clamp-1 mt-1">{tpl.content}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(tpl.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
