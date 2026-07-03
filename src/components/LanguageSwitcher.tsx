'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Languages, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  function onAutoTranslate(lang: string) {
    // Find the hidden Google Translate combo box and trigger change
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event('change'));
    }
  }

  // Helper to reset Google Translate when going to official Bengali
  function resetAutoTranslate() {
    onAutoTranslate('bn'); 
    // Sometimes Google Translate sets cookies, we could also clear the 'googtrans' cookie if needed, 
    // but triggering 'bn' usually reverts it.
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-full outline-none">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-slate-500 font-medium">Official Language (SEO)</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onSelectChange('en')} className={locale === 'en' ? 'bg-slate-100 dark:bg-slate-800 font-bold' : ''}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { onSelectChange('bn'); resetAutoTranslate(); }} className={locale === 'bn' ? 'bg-slate-100 dark:bg-slate-800 font-bold' : ''}>
          বাংলা
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1.5">
           <Sparkles className="h-3.5 w-3.5" />
           Live Auto-Translate
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAutoTranslate('en')} className="text-slate-600 dark:text-slate-300">
          Translate to English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAutoTranslate('hi')} className="text-slate-600 dark:text-slate-300">
          Translate to Hindi
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
