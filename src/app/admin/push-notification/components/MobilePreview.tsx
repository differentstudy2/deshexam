import React from 'react';
import { Smartphone, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MobilePreviewProps {
  title: string;
  message: string;
  imageUrl?: string;
  appName?: string;
}

export function MobilePreview({ title, message, imageUrl, appName = "DeshExam" }: MobilePreviewProps) {
  // Use a static time to prevent hydration mismatch errors
  const timeString = "09:41";

  return (
    <Card className="shadow-lg border-muted/50 overflow-hidden sticky top-6 bg-slate-50/50 backdrop-blur-xl">
      <CardHeader className="bg-slate-100/50 pb-4 border-b">
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-700">
          <span className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Live Preview
          </span>
          <div className="flex gap-1 text-[10px] uppercase font-bold text-slate-400">
            <span className="bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">Android</span>
            <span className="px-2 py-0.5 rounded-full">iOS</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 flex justify-center bg-slate-100/30">
        {/* Phone Bezel */}
        <div className="relative w-[280px] h-[580px] bg-black rounded-[40px] shadow-2xl p-3 border-4 border-slate-800 flex flex-col">
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-[20px] w-32 mx-auto z-20 flex justify-center items-end pb-1">
             <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
          </div>
          
          {/* Screen */}
          <div className="flex-1 bg-gradient-to-b from-slate-100 to-slate-200 rounded-[32px] overflow-hidden relative border border-slate-700/50">
            
            {/* Status Bar */}
            <div className="h-10 w-full flex justify-between items-center px-6 pt-1 text-[11px] font-medium text-slate-800 z-10 relative">
              <span>{timeString}</span>
              <div className="flex gap-1.5 items-center">
                 {/* Signal */}
                 <div className="w-3 h-3 flex items-end gap-[1px]">
                   <div className="w-[2px] h-[4px] bg-slate-800 rounded-sm"></div>
                   <div className="w-[2px] h-[6px] bg-slate-800 rounded-sm"></div>
                   <div className="w-[2px] h-[8px] bg-slate-800 rounded-sm"></div>
                   <div className="w-[2px] h-[10px] bg-slate-800 rounded-sm"></div>
                 </div>
                 {/* Battery */}
                 <div className="w-4 h-2 border border-slate-800 rounded-sm p-[1px] relative">
                    <div className="bg-slate-800 w-2 h-full rounded-sm"></div>
                    <div className="absolute right-[-2px] top-[2px] w-[2px] h-[2px] bg-slate-800"></div>
                 </div>
              </div>
            </div>

            {/* Lock screen background */}
            <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-3xl"></div>
            </div>

            {/* Notification Bubble */}
            <div className="relative z-10 mt-16 px-4">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
                {/* Header */}
                <div className="px-3 py-2 flex justify-between items-center border-b border-slate-100/50 bg-white/40">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                      D
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">{appName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    now
                  </span>
                </div>
                
                {/* Content */}
                <div className="p-3">
                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight mb-1 break-words">
                    {title || 'Notification Title'}
                  </h4>
                  <p className="text-[12px] text-slate-600 leading-snug line-clamp-3 break-words">
                    {message || 'Your notification message will appear here...'}
                  </p>
                  
                  {imageUrl && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                      <img src={imageUrl} alt="Notification Banner" className="w-full h-32 object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Home indicator */}
          <div className="absolute bottom-2 inset-x-0 mx-auto w-1/3 h-1 bg-white/20 rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );
}
