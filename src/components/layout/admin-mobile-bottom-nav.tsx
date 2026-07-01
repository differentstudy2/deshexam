"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { href: "/admin", label: "Dashboard", icon: <LayoutGrid className="h-5 w-5" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-5 w-5" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export function AdminMobileBottomNav() {
  const pathname = usePathname();

  // Hide the global bottom navigation on specific pages that provide their own mobile actions
  if (pathname.startsWith("/admin/faqs")) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
      <nav className="flex justify-around items-center h-16 px-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ease-in-out active:scale-95",
                isActive 
                  ? "text-[#00a651] dark:text-[#00a651]" 
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-8 rounded-full transition-all duration-300",
                isActive ? "bg-[#00a651]/10 dark:bg-[#00a651]/20 scale-110" : "scale-100"
              )}>
                {item.icon}
              </div>
              <span className={cn(
                "text-[10px] font-medium tracking-wide transition-all duration-300",
                isActive ? "font-bold scale-105" : "scale-100"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
