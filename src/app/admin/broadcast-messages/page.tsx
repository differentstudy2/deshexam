'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Plus, Trash2, Loader2, Send } from 'lucide-react';
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

interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  isActive: boolean;
  createdAt: any;
}

export default function BroadcastMessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newMessage, setNewMessage] = useState({
    title: '',
    message: '',
    type: 'info' as const,
  });

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'broadcast_messages'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BroadcastMessage[];
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleCreate = async () => {
    if (!newMessage.title || !newMessage.message) {
      toast({ title: 'Error', description: 'Title and message are required', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'broadcast_messages'), {
        ...newMessage,
        isActive: true,
        createdAt: serverTimestamp()
      });
      toast({ title: 'Success', description: 'Broadcast message created' });
      setNewMessage({ title: '', message: '', type: 'info' });
      fetchMessages();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteDoc(doc(db, 'broadcast_messages', id));
      toast({ title: 'Deleted', description: 'Message has been removed' });
      fetchMessages();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-indigo-600" />
          Broadcast Messages
        </h1>
        <p className="text-slate-500 mt-2">Manage global announcements and in-app banners for all users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Message</CardTitle>
              <CardDescription>Send a new announcement to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={newMessage.title}
                  onChange={e => setNewMessage({...newMessage, title: e.target.value})}
                  placeholder="e.g. Scheduled Maintenance"
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea 
                  value={newMessage.message}
                  onChange={e => setNewMessage({...newMessage, message: e.target.value})}
                  placeholder="Enter the announcement details..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newMessage.type}
                  onChange={e => setNewMessage({...newMessage, type: e.target.value as any})}
                >
                  <option value="info">Info (Blue)</option>
                  <option value="success">Success (Green)</option>
                  <option value="warning">Warning (Yellow)</option>
                  <option value="danger">Danger (Red)</option>
                </select>
              </div>
              <Button onClick={handleCreate} disabled={isSubmitting} className="w-full mt-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Broadcast
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Active & Past Messages</CardTitle>
              <CardDescription>A log of all broadcast messages</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-slate-500 animate-pulse">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                  <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>No broadcast messages found.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map(msg => (
                        <TableRow key={msg.id}>
                          <TableCell>
                            <Badge variant={
                              msg.type === 'danger' ? 'destructive' : 
                              msg.type === 'warning' ? 'default' : 
                              msg.type === 'success' ? 'secondary' : 'outline'
                            }>
                              {msg.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{msg.title}</div>
                            <div className="text-sm text-slate-500 line-clamp-1">{msg.message}</div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(msg.id)}>
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
