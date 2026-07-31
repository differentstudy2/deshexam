'use client';

import React, { useState } from 'react';
import { migrateTaxonomyNodesForSeo } from '@/lib/firebase/migration';

export default function MigrateSeoPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMigration = async () => {
    setLoading(true);
    setLogs(['Starting migration... Please wait.']);
    
    // Pass a callback to get live progress updates
    await migrateTaxonomyNodesForSeo((msg) => {
      setLogs((prev) => [...prev, msg]);
    });
    
    setLoading(false);
  };

  return (
    <div className="p-10 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">SEO Database Migration</h1>
      <p className="text-slate-600 mb-6">
        Click the button below to generate `fullSlug`, `slug`, `ancestors`, and `url_redirects` for all taxonomy nodes.
      </p>
      
      <button 
        onClick={handleMigration}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running Migration...' : 'Run Migration Now'}
      </button>

      <div className="mt-8 bg-slate-900 text-green-400 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm shadow-inner">
        {logs.length === 0 ? (
          <span className="text-slate-500">Awaiting execution...</span>
        ) : (
          logs.map((log, i) => <div key={i}>{log}</div>)
        )}
      </div>
    </div>
  );
}
