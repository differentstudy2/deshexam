'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, ListTodo } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function AdminTodoPage() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      text: 'Integrate Firebase Identity Platform (Blaze Plan) to make Two-Factor Authentication (2FA) live via SMS/App.',
      completed: false
    },
    {
      id: '2',
      text: 'Set up Firebase Cloud Functions and an email provider (like Resend) to make Login Alerts live.',
      completed: false
    },
    {
      id: '3',
      text: 'Design Premium Dashboard Home: Add Current XP, level progress, recent study history, and interactive charts.',
      completed: false
    },
    {
      id: '4',
      text: 'Build Admin Panel Analytics: Create beautiful charts and statistics (daily signups, exam taken count, revenue).',
      completed: false
    },
    {
      id: '5',
      text: 'Enhance Leaderboard & Gamification: Make the achievements page more attractive to encourage student engagement.',
      completed: false
    },
    {
      id: '6',
      text: 'Redesign Landing Page: Give the homepage a modern, premium look with 3D elements and smooth animations.',
      completed: false
    }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([
      ...todos,
      { id: Date.now().toString(), text: newTodo.trim(), completed: false }
    ]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#4f46e5]/10 rounded-xl">
          <ListTodo className="w-8 h-8 text-[#4f46e5]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Developer To-Do List</h1>
          <p className="text-slate-500">Manage upcoming features and technical debt</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="E.g. Set up payment gateway..." 
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <Button onClick={handleAddTodo} className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks ({todos.filter(t => !t.completed).length} pending)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todos.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No tasks found. You are all caught up!</p>
          ) : (
            todos.map((todo, index) => (
              <div 
                key={todo.id} 
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  todo.completed 
                    ? 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800' 
                    : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                }`}
              >
                <div className="pt-1">
                  <Checkbox 
                    checked={todo.completed} 
                    onCheckedChange={() => toggleTodo(todo.id)} 
                  />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                    {index + 1}. {todo.text}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteTodo(todo.id)}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
