"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Award, Gem, FileText, BookUser } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { 
    href: '/dashboard', 
    label: 'Home', 
    icon: <LayoutDashboard className="w-[22px] h-[22px]" />,
    activeColor: 'text-green-600 dark:text-green-500',
    activeBg: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
  },
  { 
    href: '/dashboard/practice', 
    label: 'Practice', 
    icon: <Award className="w-[22px] h-[22px]" />,
    activeColor: 'text-purple-600 dark:text-purple-500',
    activeBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
  },
  { 
    href: '/dashboard/question-bank', 
    label: 'Q-Bank', 
    icon: <Gem className="w-[22px] h-[22px]" />,
    activeColor: 'text-blue-600 dark:text-blue-500',
    activeBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
  },
  { 
    href: '/dashboard/exams', 
    label: 'Exams', 
    icon: <FileText className="w-[22px] h-[22px]" />,
    activeColor: 'text-orange-600 dark:text-orange-500',
    activeBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
  },
  { 
    href: '/dashboard/profile', 
    label: 'Profile', 
    icon: <BookUser className="w-[22px] h-[22px]" />,
    activeColor: 'text-rose-600 dark:text-rose-500',
    activeBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-[68px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden shadow-[0_-4px_15px_-4px_rgba(0,0,0,0.05)] pb-safe pt-1">
      {bottomNavItems.map((item) => {
        // Strict matching for home to avoid active state on all sub-routes,
        // and startsWith for others to keep active state when inside a sub-route.
        const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive 
                ? item.activeColor
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-xl transition-all duration-300", 
              isActive && item.activeBg
            )}>
              {item.icon}
            </div>
            <span className={cn(
              "text-[10px] font-medium leading-none tracking-tight",
              isActive && "font-bold"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
