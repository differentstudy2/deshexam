import React from 'react';
import { Users, Send, MousePointerClick, Activity, AlertCircle, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsBarProps {
  subscriberCount: number;
}

export function AnalyticsBar({ subscriberCount }: AnalyticsBarProps) {
  const stats = [
    {
      title: "Total Subscribers",
      value: subscriberCount.toLocaleString(),
      trend: "+12% this month",
      icon: <Users className="h-4 w-4 text-blue-500" />,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Delivered Today",
      value: "58,220",
      trend: "Mock data",
      icon: <Send className="h-4 w-4 text-green-500" />,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      title: "Open Rate",
      value: "32%",
      trend: "+2.4% avg",
      icon: <Activity className="h-4 w-4 text-purple-500" />,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      title: "CTR",
      value: "12.4%",
      trend: "Mock data",
      icon: <MousePointerClick className="h-4 w-4 text-emerald-500" />,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      title: "Failed Delivery",
      value: "1.8%",
      trend: "-0.5% avg",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      title: "Scheduled",
      value: "12",
      trend: "Campaigns",
      icon: <CalendarClock className="h-4 w-4 text-orange-500" />,
      color: "text-orange-500",
      bg: "bg-orange-50",
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="border-muted shadow-sm hover:shadow-md transition-all group">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex justify-between items-start">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.title}</p>
              <div className={`p-1.5 rounded-md ${stat.bg} ${stat.color} bg-opacity-50 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">{stat.trend}</p>
            </div>
            
            {/* Fake little sparkline graph just for premium UI feel */}
            <div className="mt-2 h-6 flex items-end gap-[2px] opacity-40 group-hover:opacity-100 transition-opacity">
              {Array.from({ length: 12 }).map((_, j) => (
                <div 
                  key={j} 
                  className={`flex-1 rounded-t-sm ${stat.bg.replace('bg-', 'bg-').replace('-50', '-300')}`}
                  style={{ height: `${Math.random() * 100}%` }}
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
