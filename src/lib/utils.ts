import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTitleForBrowser(text: string): string {
    if (!text) return '';
    // This is a simplified parser and won't handle all complex LaTeX,
    // but it covers common cases for a readable title.
    return text
        .replace(/\$(.*?)\$/g, '$1') // Remove inline math delimiters
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)') // \frac{a}{b} -> (a/b)
        .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)') // \sqrt{a} -> sqrt(a)
        .replace(/\\([a-zA-Z]+)/g, '') // Remove other text-based commands like \sin, \log
        .replace(/[\{\}\^\_]/g, '') // Remove braces and script characters
        .replace(/\s\s+/g, ' ') // Collapse multiple spaces
        .trim();
}

export function slugify(text: string): string {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')           // Replace spaces and underscores with -
        .replace(/[^\p{L}\p{M}\p{N}\-]/gu, '') // Keep unicode letters, marks (vowels/conjuncts), numbers, and hyphens
        .replace(/\-\-+/g, '-')            // Replace multiple - with single -
        .replace(/^-+/, '')                // Trim - from start of text
        .replace(/-+$/, '')                // Trim - from end of text
        .substring(0, 100);                // Cap length to 100 chars max
}

export const serializeTimestamps = (data: any): any => {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(item => serializeTimestamps(item));
  if (typeof data === 'object' && data !== null) {
      if (data.hasOwnProperty('seconds') && typeof (data as any).toDate === 'function') {
          return (data as any).toDate().toISOString();
      }
      const newObj: { [key: string]: any } = {};
      for (const key in data) newObj[key] = serializeTimestamps(data[key]);
      return newObj;
  }
  return data;
};

export function getGrade(percentage: number): { grade: string; color: string } {
  if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-500 dark:text-emerald-400' };
  if (percentage >= 80) return { grade: 'A', color: 'text-emerald-500 dark:text-emerald-400' };
  if (percentage >= 70) return { grade: 'B+', color: 'text-blue-500 dark:text-blue-400' };
  if (percentage >= 60) return { grade: 'B', color: 'text-blue-500 dark:text-blue-400' };
  if (percentage >= 50) return { grade: 'C+', color: 'text-amber-500 dark:text-amber-400' };
  if (percentage >= 40) return { grade: 'C', color: 'text-amber-500 dark:text-amber-400' };
  if (percentage >= 33) return { grade: 'D', color: 'text-orange-500 dark:text-orange-400' };
  return { grade: 'F', color: 'text-red-500 dark:text-red-400' };
}
