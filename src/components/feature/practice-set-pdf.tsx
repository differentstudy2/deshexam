
'use client';

import React from 'react';
import type { PracticeSet, Question } from '@/lib/types';
import { DeshExamLogo } from '@/components/icons';

type PracticeSetPDFProps = {
  practiceSet: PracticeSet;
  questions: Question[];
  textbookTitle: string;
  chapterTitle: string;
  topicTitle: string;
  board: string;
  className: string;
  subject: string;
  totalMarks: number;
};

const toBengaliNumerals = (num: number | string) => {
    const n = num.toString();
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.split('').map(digit => bengaliDigits[parseInt(digit, 10)] || digit).join('');
};


export const PracticeSetPDF: React.FC<PracticeSetPDFProps> = ({
  practiceSet,
  questions,
  textbookTitle,
  chapterTitle,
  topicTitle,
  board,
  className,
  subject,
  totalMarks
}) => {
  return (
    <div>
        <div style={{ padding: '12.7mm', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
                <div style={{ width: '70%' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{textbookTitle}</h2>
                    <div style={{ fontSize: '14px', color: '#555' }}>
                        <span>বোর্ড: {board}</span> | <span>বিষয়: {subject}</span> | <span>শ্রেণী: {className}</span>
                    </div>
                </div>
                <div style={{ width: '30%', textAlign: 'right' }}>
                    <DeshExamLogo />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{practiceSet.title}</h3>
                    <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>অধ্যায়: {chapterTitle} {topicTitle && ` | বিষয়: ${topicTitle}`}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>পূর্ণমান: {toBengaliNumerals(totalMarks)}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>সময়: {toBengaliNumerals(practiceSet.duration || totalMarks)} মিনিট</p>
                </div>
            </div>

            {questions.map((q, index) => (
                <div key={q.id || index} style={{ marginBottom: '20px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{toBengaliNumerals(index + 1)}. {q.text}</p>
                    {q.type === 'Multiple Choice' && q.options && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {q.options.map((opt, optIndex) => (
                                <div key={optIndex} style={{ border: '1px solid #eee', padding: '8px', borderRadius: '4px' }}>
                                    ({String.fromCharCode(97 + optIndex)}) {opt.text}
                                </div>
                            ))}
                        </div>
                    )}
                     {q.type === 'True/False' && (
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <span>(a) True</span>
                            <span>(b) False</span>
                        </div>
                    )}
                     {q.type === 'Fill in the Blank' && (
                         <div style={{ marginTop: '20px', borderBottom: '1px solid #333' }}></div>
                     )}
                     {q.type === 'Short Answer' && (
                          <div style={{ marginTop: '20px', height: '60px', border: '1px dashed #ccc', borderRadius: '4px' }}></div>
                     )}
                     {q.type === 'Matching' && q.matchingOptions && (
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <div>
                                 <strong>Column A</strong>
                                 <ul style={{ listStyle: 'none', padding: 0 }}>
                                     {q.matchingOptions.columnA.map((item, i) => <li key={i}>{i+1}. {item.text}</li>)}
                                 </ul>
                             </div>
                             <div>
                                 <strong>Column B</strong>
                                  <ul style={{ listStyle: 'none', padding: 0 }}>
                                     {q.matchingOptions.columnB.map((item, i) => <li key={i}>({String.fromCharCode(97 + i)}) {item.text}</li>)}
                                 </ul>
                             </div>
                         </div>
                     )}
                </div>
            ))}
        </div>
    </div>
  );
};
