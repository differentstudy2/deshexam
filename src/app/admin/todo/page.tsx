'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, ListTodo, CalendarIcon, Edit2, X, Check, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AdminTodo, subscribeToAdminTodos, addAdminTodo, updateAdminTodo, deleteAdminTodo } from '@/lib/firebase/todo';

export default function AdminTodoPage() {
  const [todos, setTodos] = useState<AdminTodo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New task state
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newDueDate, setNewDueDate] = useState<Date | undefined>();

  // Edit task state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTodoText, setEditTodoText] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editDueDate, setEditDueDate] = useState<Date | undefined>();

  useEffect(() => {
    const unsubscribe = subscribeToAdminTodos((data) => {
      setTodos(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const seedInitialTodos = async () => {
    const initialTodos = [
      { text: 'Integrate Firebase Identity Platform (Blaze Plan) to make Two-Factor Authentication (2FA) live via SMS/App.', completed: false, priority: 'high' as const },
      { text: 'Set up Firebase Cloud Functions and an email provider (like Resend) to make Login Alerts live.', completed: false, priority: 'high' as const },
      { text: 'Design Premium Dashboard Home: Add Current XP, level progress, recent study history, and interactive charts.', completed: false, priority: 'medium' as const },
      { text: 'Build Admin Panel Analytics: Create beautiful charts and statistics (daily signups, exam taken count, revenue).', completed: false, priority: 'medium' as const },
      { text: 'Enhance Leaderboard & Gamification: Make the achievements page more attractive to encourage student engagement.', completed: false, priority: 'low' as const },
      { text: 'Redesign Landing Page: Give the homepage a modern, premium look with 3D elements and smooth animations.', completed: false, priority: 'low' as const },
      // New Brainstormed Features
      { text: 'Add Global Search (Command Palette) using Ctrl+K for quick admin navigation', completed: false, priority: 'high' as const },
      { text: 'Implement Multi-language Support (i18n) for Bengali and English users', completed: false, priority: 'medium' as const },
      { text: 'Add Offline Mode / PWA support so students can view saved notes without internet', completed: false, priority: 'medium' as const },
      { text: 'Develop an AI-powered Mock Interview bot for job preparation', completed: false, priority: 'low' as const },
      { text: 'Create a Referral System to reward students for inviting friends', completed: false, priority: 'high' as const },
      { text: 'Add Live Chat Support or a helpdesk ticketing system for student queries', completed: false, priority: 'medium' as const },
    ];
    for (const todo of initialTodos) {
      await addAdminTodo({ ...todo, tags: [] });
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      await addAdminTodo({
        text: newTodo.trim(),
        completed: false,
        priority: newPriority,
        dueDate: newDueDate || null,
        tags: []
      });
      setNewTodo('');
      setNewPriority('medium');
      setNewDueDate(undefined);
    } catch (err) {
      console.error('Failed to add todo', err);
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    await updateAdminTodo(id, { completed: !currentStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteAdminTodo(id);
    }
  };

  const startEditing = (todo: AdminTodo) => {
    setEditingId(todo.id);
    setEditTodoText(todo.text);
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate || undefined);
  };

  const saveEdit = async (id: string) => {
    if (!editTodoText.trim()) return;
    await updateAdminTodo(id, {
      text: editTodoText.trim(),
      priority: editPriority,
      dueDate: editDueDate || null,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'low': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#4f46e5]/10 rounded-xl">
          <ListTodo className="w-8 h-8 text-[#4f46e5]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Developer To-Do List</h1>
          <p className="text-slate-500">Manage upcoming features and technical debt</p>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-4">
          <CardTitle className="text-lg">Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input 
                placeholder="E.g. Set up payment gateway..." 
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                className="bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={newPriority} onValueChange={(val: any) => setNewPriority(val)}>
                <SelectTrigger className="w-[120px] bg-slate-50 dark:bg-slate-900/50">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[140px] justify-start text-left font-normal bg-slate-50 dark:bg-slate-900/50",
                      !newDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDueDate ? format(newDueDate, "PPP") : <span>Due Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDueDate}
                    onSelect={setNewDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button onClick={handleAddTodo} className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
              <Button onClick={seedInitialTodos} variant="outline" className="border-[#4f46e5] text-[#4f46e5]">
                💡 Load Ideas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Tasks ({todos.filter(t => !t.completed).length} pending)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f46e5]"></div>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 mb-4">No tasks found. You are all caught up!</p>
              <Button onClick={seedInitialTodos} variant="outline" className="text-xs">
                Load Default Developer Tasks
              </Button>
            </div>
          ) : (
            todos.map((todo, index) => (
              <div 
                key={todo.id} 
                className={`group flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  todo.completed 
                    ? 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-800/50 opacity-70' 
                    : 'bg-white border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-800 hover:border-[#4f46e5]/40 hover:shadow-md'
                }`}
              >
                {editingId === todo.id ? (
                  <div className="flex flex-col lg:flex-row gap-3 w-full">
                     <Input 
                        value={editTodoText}
                        onChange={(e) => setEditTodoText(e.target.value)}
                        className="flex-1"
                        autoFocus
                     />
                     <div className="flex flex-wrap sm:flex-nowrap gap-2">
                        <Select value={editPriority} onValueChange={(val: any) => setEditPriority(val)}>
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[130px] justify-start text-left font-normal",
                                !editDueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                              <span className="truncate">{editDueDate ? format(editDueDate, "MMM d, yyyy") : "Date"}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={editDueDate}
                              onSelect={setEditDueDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        <Button size="icon" onClick={() => saveEdit(todo.id)} className="bg-green-600 hover:bg-green-700 text-white shrink-0">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={cancelEdit} className="shrink-0">
                          <X className="w-4 h-4 text-slate-500" />
                        </Button>
                     </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 w-full">
                    <div className="pt-1.5 shrink-0">
                      <Checkbox 
                        checked={todo.completed} 
                        onCheckedChange={() => toggleTodo(todo.id, todo.completed)} 
                        className="data-[state=checked]:bg-[#4f46e5] data-[state=checked]:border-[#4f46e5] h-5 w-5"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
                      <p className={`text-[15px] leading-snug ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                        {index + 1}. {todo.text}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                         <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border", getPriorityColor(todo.priority))}>
                            {todo.priority}
                         </Badge>
                         
                         {todo.dueDate && (
                            <div className={cn(
                              "flex items-center text-xs px-2 py-1 rounded-md border",
                              todo.dueDate < new Date() && !todo.completed 
                                ? "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:bg-red-900/20" 
                                : "text-slate-500 border-slate-200 bg-slate-50 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/50"
                            )}>
                               <Clock className="w-3 h-3 mr-1.5" />
                               {format(todo.dueDate, "MMM d, yyyy")}
                            </div>
                         )}
                      </div>
                    </div>
                    <div className="flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startEditing(todo)}
                        className="text-slate-400 hover:text-[#4f46e5] hover:bg-[#4f46e5]/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(todo.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
