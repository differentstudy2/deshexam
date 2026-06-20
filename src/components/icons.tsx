'use client';

export const DeshExamLogo = () => (
  <div className="flex items-center gap-2">
    <img 
      src="/icons/icon-192x192.png" 
      alt="DeshExam Icon" 
      className="h-7 w-7 object-contain rounded-sm"
    />
    <div className="font-extrabold text-2xl tracking-tighter flex items-center">
        <span className="bg-gradient-to-r from-[#00a651] to-teal-400 bg-clip-text text-transparent drop-shadow-sm">DESH</span>
        <span className="ml-1 text-inherit">EXAM</span>
    </div>
  </div>
);