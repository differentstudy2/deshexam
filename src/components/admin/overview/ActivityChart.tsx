'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function ActivityChart({ data }: { data: any[] }) {
  return (
    <Card className="col-span-1 lg:col-span-2 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-xl relative overflow-hidden group">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-400/10 blur-[80px] rounded-full pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-bold font-lexend text-slate-800">Activity Overview</CardTitle>
        <CardDescription className="text-sm text-slate-500">Daily test submissions over the last week.</CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10 pb-2">
        <div className="h-[280px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSubmissionsPremium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255,255,255,0.5)', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                  color: '#0f172a'
                }} 
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="submissions" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorSubmissionsPremium)" 
                activeDot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
