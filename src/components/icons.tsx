'use client';

import Image from 'next/image';
import iconImage from '../../public/icons/icon-192x192.png';

export const DeshExamLogo = () => (
  <div className="flex items-center gap-2">
    <Image 
      src={iconImage} 
      alt="DeshExam Icon" 
      className="h-8 w-8 object-contain"
      width={32}
      height={32}
    />
    <div className="font-extrabold text-2xl tracking-tighter flex items-center">
        <span className="bg-gradient-to-r from-[#00a651] to-teal-400 bg-clip-text text-transparent drop-shadow-sm">DESH</span>
        <span className="ml-1 text-inherit">EXAM</span>
    </div>
  </div>
);