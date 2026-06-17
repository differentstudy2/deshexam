'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Shield, ChevronRight, BookOpen, LayoutGrid, List, Target } from 'lucide-react';
import { indianBoards, IndianBoard } from '@/lib/data/indian-boards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createTaxonomyNode } from '@/lib/firebase/taxonomy';
import { useToast } from '@/hooks/use-toast';

export default function GuideBoardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const filteredBoards = indianBoards.filter(board => 
    board.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    board.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (board.state && board.state.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const centralBoards = filteredBoards.filter(b => b.type === 'Central');
  const stateBoards = filteredBoards.filter(b => b.type === 'State');

  // Utility to get a nice gradient based on the acronym's first letter
  const getGradient = (acronym: string) => {
    const charCode = acronym.charCodeAt(0) || 65;
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600',
      'from-rose-500 to-red-600',
    ];
    return gradients[charCode % gradients.length];
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    let successCount = 0;
    try {
      for (const board of indianBoards) {
        // Attempt to create. This is a very simple seed without duplication checks.
        await createTaxonomyNode({
          title: board.title,
          slug: board.slug,
          type: 'board',
          track: 'academic',
          parentId: null,
          status: 'published',
          description: `${board.type} Educational Board`
        });
        successCount++;
      }
      toast({ title: 'Database Seeded!', description: `Successfully inserted ${successCount} boards.`});
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error seeding database', description: String(error) });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] relative pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-indigo-900 via-indigo-800 to-slate-50 dark:to-[#020817] pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="text-indigo-200 border-indigo-400 bg-indigo-950/50 backdrop-blur-md px-4 py-1 text-sm font-medium">
            Academic Directory
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Explore All Educational Boards
          </h1>
          <p className="text-indigo-200 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Find complete curriculum, syllabus, and study materials for over 50 Central and State Boards across India.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by board name, acronym (e.g., CBSE), or state..."
                className="w-full pl-12 pr-4 py-4 md:py-5 rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-indigo-100 shadow-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 text-slate-800 text-lg transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        
        {/* Toolbar */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
          <div className="text-slate-600 dark:text-slate-400 font-medium">
            Showing {filteredBoards.length} Boards
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="h-9 w-9">
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="h-9 w-9">
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {filteredBoards.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <Shield className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">No boards found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search terms.</p>
          </div>
        )}

        {/* Central Boards */}
        {centralBoards.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Central Boards</h2>
            </div>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {centralBoards.map(board => (
                <BoardCard key={board.id} board={board} gradient={getGradient(board.acronym)} viewMode={viewMode} />
              ))}
            </div>
          </div>
        )}

        {/* State Boards */}
        {stateBoards.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">State Boards</h2>
            </div>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {stateBoards.map(board => (
                <BoardCard key={board.id} board={board} gradient={getGradient(board.acronym)} viewMode={viewMode} />
              ))}
            </div>
          </div>
        )}

        {/* Admin Seed Button (Hidden in normal flow, available for setup) */}
        <div className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-sm text-slate-500 mb-4">Admin: Ensure these boards exist in your database for routing.</p>
          <Button variant="outline" onClick={handleSeedDatabase} disabled={isSeeding}>
            {isSeeding ? 'Seeding Database...' : 'Seed 50 Boards to Database'}
          </Button>
        </div>

      </div>
    </div>
  );
}

function BoardCard({ board, gradient, viewMode }: { board: IndianBoard, gradient: string, viewMode: 'grid'|'list' }) {
  if (viewMode === 'list') {
    return (
      <Link href={`/guide/${board.slug}`} className="block group">
        <Card className="hover:shadow-md transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm group-hover:border-indigo-400 dark:group-hover:border-indigo-500">
          <CardContent className="p-4 flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 shrink-0 shadow-sm`}>
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Shield className="w-8 h-8 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {board.acronym}
                </h3>
                {board.state && <Badge variant="secondary" className="text-xs font-normal">{board.state}</Badge>}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-1">{board.title}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors transform group-hover:translate-x-1" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/guide/${board.slug}`} className="block group h-full">
      <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl group-hover:border-indigo-400 dark:group-hover:border-indigo-500 overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 shadow-md transform group-hover:scale-105 transition-transform`}>
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex flex-col items-center justify-center">
                <Shield className="w-6 h-6 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
                <span className="text-[9px] font-bold mt-0.5 tracking-tighter uppercase">{board.acronym.slice(0,4)}</span>
              </div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {board.acronym}
              </h3>
              {board.state && (
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border-0 px-2">
                  {board.state}
                </Badge>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 min-h-[40px]">
              {board.title}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
