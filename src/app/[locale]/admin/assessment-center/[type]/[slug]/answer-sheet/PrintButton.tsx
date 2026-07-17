'use client';
import React from 'react';

export default function PrintButton() {
    return (
        <div className="fixed bottom-8 right-8 print:hidden">
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
