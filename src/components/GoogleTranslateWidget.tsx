'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export function GoogleTranslateWidget() {
  useEffect(() => {
    // Hide the intrusive Google Translate banner and body margin
    const addStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        body { top: 0 !important; }
        .skiptranslate iframe { display: none !important; }
        #goog-gt-tt { display: none !important; }
        .goog-te-banner-frame { display: none !important; }
        .goog-te-menu-value { display: flex; align-items: center; gap: 4px; }
      `;
      document.head.appendChild(style);
    };
    addStyles();
  }, []);

  return (
    <>
      <div 
        id="google_translate_element" 
        className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-800 rounded-md shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100 transition-opacity [&_.goog-te-gadget]:text-transparent [&_.goog-te-gadget]:!h-[32px] [&_.goog-te-combo]:h-8 [&_.goog-te-combo]:rounded [&_.goog-te-combo]:border-0 [&_.goog-te-combo]:bg-white [&_.goog-te-combo]:dark:bg-slate-800 [&_.goog-te-combo]:text-sm [&_.goog-te-combo]:outline-none [&_.goog-te-combo]:px-2 [&_.goog-te-combo]:dark:text-white"
      ></div>
      <Script 
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
      <Script id="google-translate-init" strategy="lazyOnload">
        {`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'bn',
              includedLanguages: 'en,bn',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
          }
        `}
      </Script>
    </>
  );
}
