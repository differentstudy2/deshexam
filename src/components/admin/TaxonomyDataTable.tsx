'use client';

import React, { useEffect, useState } from 'react';
import { getTaxonomyNodesByType, TaxonomyNode, NodeType } from '@/lib/firebase/taxonomy';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Layers, Calendar, Hash, Tag, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  type: NodeType;
  title: string;
}

export function TaxonomyDataTable({ type, title }: Props) {
  const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTaxonomyNodesByType('academic', type);
        setNodes(data);
      } catch (error) {
        console.error(`Error fetching taxonomy nodes of type ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  const filteredNodes = nodes.filter(node => 
    node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.slug && node.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" />
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all academic {title.toLowerCase()} in the database.</p>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <DatabaseZap className="w-5 h-5 text-emerald-500" />
              Data Table
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search by title or slug..." 
                className="pl-9 h-9 bg-gray-50/50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">Loading data...</div>
          ) : filteredNodes.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNodes.map((node) => (
                    <TableRow key={node.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">
                        {node.title}
                        {node.icon && <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Icon: {node.icon}</span>}
                      </TableCell>
                      <TableCell className="text-gray-500 font-mono text-xs">{node.slug || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={node.status === 'active' || node.status === 'published' ? 'default' : 'secondary'} 
                               className={node.status === 'active' || node.status === 'published' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : ''}>
                          {node.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Hash className="w-3 h-3" />
                          {node.orderIndex || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-gray-500 text-sm">
                        {node.createdAt ? format(node.createdAt.toDate(), 'MMM dd, yyyy') : 'Unknown'}
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
  );
}

// Simple fallback icon for header
function DatabaseZap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
      <path d="M13 13.5 9 18l4-1.5z" />
    </svg>
  )
}
