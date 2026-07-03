'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-full">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSelectChange('en')} className={locale === 'en' ? 'bg-slate-100 dark:bg-slate-800 font-bold' : ''}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelectChange('bn')} className={locale === 'bn' ? 'bg-slate-100 dark:bg-slate-800 font-bold' : ''}>
          বাংলা
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
