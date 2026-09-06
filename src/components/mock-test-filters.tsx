
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

type MetafieldItem = { id: string, name: string };

type MockTestFiltersProps = {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    subjects: MetafieldItem[];
    selectedSubject: string;
    onSubjectChange: (subject: string) => void;
}

export function MockTestFilters({ 
    searchQuery, onSearchQueryChange,
    subjects, selectedSubject, onSubjectChange,
}: MockTestFiltersProps) {
  return (
    <div className="mb-8 p-4 bg-card border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for a test..." 
            className="pl-10 h-10 w-full"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
        <Select value={selectedSubject} onValueChange={onSubjectChange}>
            <SelectTrigger>
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
