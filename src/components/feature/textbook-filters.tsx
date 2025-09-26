
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

type MetafieldItem = { id: string, name: string };

type TextbookFiltersProps = {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    subjects: MetafieldItem[];
    selectedSubject: string;
    onSubjectChange: (subject: string) => void;
    classes: MetafieldItem[];
    selectedClass: string;
    onClassChange: (className: string) => void;
    boards: MetafieldItem[];
    selectedBoard: string;
    onBoardChange: (board: string) => void;
}

export function TextbookFilters({
    searchQuery,
    onSearchQueryChange,
    subjects,
    selectedSubject,
    onSubjectChange,
    classes,
    selectedClass,
    onClassChange,
    boards,
    selectedBoard,
    onBoardChange
}: TextbookFiltersProps) {
  return (
    <div className="mb-8 p-4 bg-card border rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by textbook title..." 
            className="pl-10 h-10" 
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
        <Select value={selectedBoard} onValueChange={onBoardChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Filter by board" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Boards</SelectItem>
            {boards.map((board) => (
              <SelectItem key={board.id} value={board.name}>{board.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
         <Select value={selectedClass} onValueChange={onClassChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSubject} onValueChange={onSubjectChange}>
          <SelectTrigger className="h-10 lg:col-start-3">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
