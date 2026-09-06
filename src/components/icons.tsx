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
        <span>
            <span className="text-[#FF9933]">DESH</span> <span className="text-[rgb(18,208,0)]">EXAM</span>
        </span>
    </div>
  </div>
);