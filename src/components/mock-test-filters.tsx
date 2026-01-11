
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
    boards: MetafieldItem[];
    selectedBoard: string;
    onBoardChange: (board: string) => void;
    classCategories: MetafieldItem[];
    selectedClassCategory: string;
    onClassCategoryChange: (classCategory: string) => void;
    grades: MetafieldItem[];
    selectedGrade: string;
    onGradeChange: (grade: string) => void;
}

export function MockTestFilters({ 
    searchQuery, onSearchQueryChange,
    subjects, selectedSubject, onSubjectChange,
    boards, selectedBoard, onBoardChange,
    classCategories, selectedClassCategory, onClassCategoryChange,
    grades, selectedGrade, onGradeChange
}: MockTestFiltersProps) {
  return (
    <div className="mb-8 p-4 bg-card border rounded-lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for a test..." 
            className="pl-10 h-10 w-full"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={selectedBoard} onValueChange={onBoardChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by board" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Boards</SelectItem>
                    {boards.map((board) => (
                    <SelectItem key={board.id} value={board.name}>{board.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedClassCategory} onValueChange={onClassCategoryChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by Class Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Class Categories</SelectItem>
                    {classCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedGrade} onValueChange={onGradeChange} disabled={selectedClassCategory === 'all' || grades.length === 0}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by Grade" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map((g) => (
                        <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

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
    </div>
  );
}
