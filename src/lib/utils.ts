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
