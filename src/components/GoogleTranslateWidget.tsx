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
        #google_translate_element { display: none !important; }
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
        className="hidden"
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
