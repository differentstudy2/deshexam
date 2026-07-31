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
        <span className="bg-gradient-to-r from-[#FF9933] via-gray-100 to-[#138808] bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            DESH EXAM
        </span>
    </div>
  </div>
);