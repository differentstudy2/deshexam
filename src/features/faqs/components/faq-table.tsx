"use client";

import { FAQ } from "../types/faq.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, GripVertical } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface FAQTableProps {
  data: FAQ[];
  loading: boolean;
  onDelete: (id: string) => void;
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export const FAQTable = ({ data, loading, onDelete, selectedIds, onSelect, onSelectAll }: FAQTableProps) => {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  if (loading) {
    return (
      <div className="border rounded-lg p-12 flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center text-slate-500 bg-white">
        No FAQs found matching your criteria.
      </div>
    );
  }

  const getStatusColor = (status: FAQ['status']) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800 border-green-200";
      case "draft": return "bg-amber-100 text-amber-800 border-amber-200";
      case "hidden": return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="w-[40px] px-4">
              <Checkbox 
                checked={allSelected} 
                onCheckedChange={(checked) => onSelectAll(checked as boolean)} 
              />
            </TableHead>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[40%] font-semibold">Question</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Views</TableHead>
            <TableHead className="font-semibold text-right">Updated</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((faq) => (
            <TableRow key={faq.id} className="group">
              <TableCell className="px-4">
                <Checkbox 
                  checked={selectedIds.includes(faq.id)} 
                  onCheckedChange={(checked) => onSelect(faq.id, checked as boolean)} 
                />
              </TableCell>
              <TableCell>
                <button className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                </button>
              </TableCell>
              <TableCell className="font-medium text-slate-900">
                <div className="flex flex-col">
                  <span className="line-clamp-1" title={faq.question}>{faq.question}</span>
                  <span className="text-xs text-slate-400 font-normal mt-0.5 line-clamp-1" title={faq.answer}>{faq.answer}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize bg-slate-50 font-medium">
                  {faq.categoryId.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`capitalize font-semibold ${getStatusColor(faq.status)}`}>
                  {faq.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-slate-600">
                {faq.views.toLocaleString()}
              </TableCell>
              <TableCell className="text-right text-slate-500 text-sm whitespace-nowrap">
                {format(new Date(faq.updatedAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50" title="Preview">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Link href={`/admin/faqs/edit/${faq.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50" title="Edit">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(faq.id)} 
                    className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" 
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
