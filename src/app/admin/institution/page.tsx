'use client';

import React from 'react';
import { TaxonomyDataTable } from '@/components/admin/TaxonomyDataTable';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InstitutionManagerPage() {
  const { toast } = useToast();

  const handleGoogleMapsImport = () => {
    toast({
      title: "Coming Soon",
      description: "Google Maps integration is planned for the next update!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Institution Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage physical schools, colleges, universities, and coaching institutes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleGoogleMapsImport} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <MapPin className="w-4 h-4" />
            Import from Google Maps
          </Button>
        </div>
      </div>

      {/* Render the generic data table strictly filtered for 'institution' nodes */}
      <TaxonomyDataTable type="institution" title="Institutions" />
    </div>
  );
}
