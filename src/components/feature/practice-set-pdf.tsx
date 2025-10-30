
'use client';

import type { PracticeSet, Question } from '@/lib/types';

interface PracticeSetPDFProps {
    practiceSet: PracticeSet;
    questions: Question[];
    textbookTitle: string;
    chapterTitle: string;
    topicTitle: string;
}

export const PracticeSetPDF = ({ practiceSet, questions, textbookTitle, chapterTitle, topicTitle }: PracticeSetPDFProps) => {
    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
            <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '10px' }}>{textbookTitle}</h1>
            <h2 style={{ fontSize: '20px', textAlign: 'center', marginBottom: '10px' }}>{chapterTitle}</h2>
            <h3 style={{ fontSize: '18px', textAlign: 'center', marginBottom: '10px' }}>{topicTitle}</h3>
            <h4 style={{ fontSize: '16px', textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                Practice Set: {practiceSet.title}
            </h4>
            
            <div style={{ marginTop: '20px' }}>
                {questions.map((q, index) => (
                    <div key={q.id} style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{index + 1}. {q.text}</p>
                        {q.type === 'Multiple Choice' && q.options && (
                            <div style={{ paddingLeft: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 20px' }}>
                                {q.options.map((opt, i) => (
                                    <div key={i} style={{ marginBottom: '5px' }}>
                                        ({String.fromCharCode(97 + i)}) {opt.text}
                                    </div>
                                ))}
                            </div>
                        )}
                        {q.type === 'True/False' && (
                             <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '5px' }}>(a) True</li>
                                <li style={{ marginBottom: '5px' }}>(b) False</li>
                             </ul>
                        )}
                        {(q.type === 'Short Answer' || q.type === 'Fill in the Blank') && (
                            <div style={{ marginTop: '10px', borderBottom: '1px solid #ccc', height: '20px' }}></div>
                        )}
                        {q.type === 'Matching' && q.matchingOptions && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
                                <div>
                                    <h5 style={{fontWeight: 'bold'}}>Column A</h5>
                                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                                    {q.matchingOptions.columnA.map((item, i) => <li key={i}>{i+1}. {item.text}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h5 style={{fontWeight: 'bold'}}>Column B</h5>
                                    <ul style={{ listStyleType: 'none', padding: 0 }}>
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
