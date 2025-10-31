
'use client';

import type { PracticeSet, Question } from '@/lib/types';

interface PracticeSetPDFProps {
    practiceSet: PracticeSet;
    questions: Question[];
    textbookTitle: string;
    chapterTitle: string;
    topicTitle: string;
    board: string;
    className: string; // `class` is a reserved keyword
    subject: string;
    totalMarks: number;
}

export const PracticeSetPDF = ({ 
    practiceSet, 
    questions, 
    textbookTitle, 
    chapterTitle, 
    topicTitle,
    board,
    className,
    subject,
    totalMarks
}: PracticeSetPDFProps) => {

    const duration = practiceSet.duration || totalMarks;

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
            <div style={{ padding: '15mm 12mm 20mm 12mm' }}>
                <header style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                    <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>{textbookTitle}</h1>
                    <h2 style={{ fontSize: '20px', margin: '5px 0' }}>{chapterTitle}</h2>
                    {topicTitle && <h3 style={{ fontSize: '18px', margin: '5px 0' }}>{topicTitle}</h3>}
                </header>

                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ margin: '2px 0' }}><strong>Board:</strong> {board}</p>
                        <p style={{ margin: '2px 0' }}><strong>Class:</strong> {className}</p>
                        <p style={{ margin: '2px 0' }}><strong>Subject:</strong> {subject}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '2px 0' }}><strong>Full Marks:</strong> {totalMarks}</p>
                        <p style={{ margin: '2px 0' }}><strong>Duration:</strong> {duration} minutes</p>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>General Instructions:</h4>
                    <ul style={{ fontSize: '14px', paddingLeft: '20px' }}>
                        <li>All questions are compulsory.</li>
                        <li>Read each question carefully before answering.</li>
                        <li>Marks for each question are indicated on the right.</li>
                    </ul>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    {questions.map((q, index) => {
                        const marks = q.type === 'Matching' ? q.correctAnswer?.length || 1 : q.marks;
                        return (
                            <div key={q.id} style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '10px', flexGrow: 1, paddingRight: '10px' }}>{index + 1}. {q.text}</p>
                                    <p style={{ fontWeight: 'bold' }}>[{marks}]</p>
                                </div>
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
                        );
                    })}
                </div>

                <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}>
                    <h2 style={{ textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>Answers</h2>
                    <ol style={{ paddingLeft: '20px', columns: 2 }}>
                        {questions.map((q, index) => (
                             <li key={`ans-${q.id}`} style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                                {index + 1}. {
                                    q.type === 'Matching' 
                                    ? 'See pairs below' 
                                    : Array.isArray(q.correctAnswer) 
                                        ? q.correctAnswer.map(i => i.b).join(', ') 
                                        : String(q.correctAnswer)
                                }
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};
