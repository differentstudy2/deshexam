"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FAQFilters, FAQStatus } from "../types/faq.types";
import { Search } from "lucide-react";

interface FAQFiltersBarProps {
  filters: FAQFilters;
  onFilterChange: (newFilters: Partial<FAQFilters>) => void;
}

export const FAQFiltersBar = ({ filters, onFilterChange }: FAQFiltersBarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search questions, answers, or tags... (Press '/' to focus)" 
          className="pl-9"
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>
      
      <div className="flex gap-4 flex-wrap sm:flex-nowrap">
        <Select 
          value={filters.categoryId || "all"} 
          onValueChange={(val) => onFilterChange({ categoryId: val })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="account">Account</SelectItem>
            <SelectItem value="mock_tests">Mock Tests</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="payments">Payments</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.status || "all"} 
          onValueChange={(val) => onFilterChange({ status: val === "all" ? undefined : val as FAQStatus })}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.sortBy || "latest"} 
          onValueChange={(val: any) => onFilterChange({ sortBy: val })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most_viewed">Most Viewed</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
