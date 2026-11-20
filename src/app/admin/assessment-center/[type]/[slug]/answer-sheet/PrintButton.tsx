'use client';
import React, { useEffect } from 'react';

export default function PrintButton() {
    useEffect(() => {
        const handler = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('toggle-exp')) {
                document.querySelectorAll('.toggle-exp-local').forEach(cb => {
                    const input = cb as HTMLInputElement;
                    if (input.checked !== (target as HTMLInputElement).checked) input.click();
                });
            }
            if (target.classList.contains('toggle-optexp')) {
                document.querySelectorAll('.toggle-optexp-local').forEach(cb => {
                    const input = cb as HTMLInputElement;
                    if (input.checked !== (target as HTMLInputElement).checked) input.click();
                });
            }
            if (target.classList.contains('toggle-tick')) {
                document.querySelectorAll('.toggle-tick-local').forEach(cb => {
                    const input = cb as HTMLInputElement;
                    if (input.checked !== (target as HTMLInputElement).checked) input.click();
                });
            }
            if (target.classList.contains('input-font-q')) {
                document.documentElement.style.setProperty('--font-q', (target as HTMLInputElement).value || 'inherit');
            }
            if (target.classList.contains('input-font-opt')) {
                document.documentElement.style.setProperty('--font-opt', (target as HTMLInputElement).value || 'inherit');
            }
            if (target.classList.contains('input-font-exp')) {
                document.documentElement.style.setProperty('--font-exp', (target as HTMLInputElement).value || 'inherit');
            }
            if (target.classList.contains('input-fs-q')) {
                document.documentElement.style.setProperty('--fs-q', (target as HTMLInputElement).value + 'px');
            }
            if (target.classList.contains('input-fs-opt')) {
                document.documentElement.style.setProperty('--fs-opt', (target as HTMLInputElement).value + 'px');
            }
            if (target.classList.contains('input-fs-exp')) {
                document.documentElement.style.setProperty('--fs-exp', (target as HTMLInputElement).value + 'px');
            }
            if (target.classList.contains('input-layout')) {
                document.documentElement.setAttribute('data-layout', (target as HTMLSelectElement).value);
            }
        };

        document.addEventListener('change', handler);
        document.addEventListener('input', handler);

        return () => {
            document.removeEventListener('change', handler);
            document.removeEventListener('input', handler);
        };
    }, []);

    return (
        <div className="fixed bottom-8 right-8 print:hidden z-50">
            <button 
                onClick={() => window.print()} 
                className="bg-black text-white px-6 py-3 rounded-full shadow-xl hover:bg-gray-800 font-medium flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print Answer Sheet
            </button>
        </div>
    );
}
