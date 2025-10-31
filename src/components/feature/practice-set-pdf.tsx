
'use client';

import type { PracticeSet, Question } from '@/lib/types';

interface PracticeSetPDFProps {
    practiceSet: PracticeSet;
    questions: Question[];
    textbookTitle: string;
    chapterTitle: string;
    topicTitle: string;
    board: string;
    className: string; // "class" is a reserved word
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
    totalMarks,
}: PracticeSetPDFProps) => {

    const renderBengaliLabel = (label: string) => {
        // A simple regex to check for a significant number of Bengali characters
        const bengaliRegex = /[\u0980-\u09FF]{2,}/;
        if (bengaliRegex.test(chapterTitle) || bengaliRegex.test(subject) || bengaliRegex.test(textbookTitle)) {
            switch(label) {
                case 'Institute Name': return 'প্রতিষ্ঠানের নাম';
                case 'Book Name': return 'বইয়ের নাম';
                case 'Board': return 'বোর্ড';
                case 'Subject': return 'বিষয়';
                case 'Class': return 'শ্রেণী';
                case 'Chapter': return 'অধ্যায়';
                case 'Full Marks': return 'পূর্ণমান';
                case 'Date': return 'তারিখ';
                case 'Duration': return 'সময়';
                default: return label;
            }
        }
        return label;
    }
    
    return (
        <div style={{ fontFamily: 'sans-serif', padding: '0', color: '#333', width: '210mm', minHeight: '297mm', background: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ padding: '0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderBottom: '1px solid #ccc', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                        <div><strong>{renderBengaliLabel('Institute Name')}:</strong> DeshExam.com</div>
                        <div><strong>{renderBengaliLabel('Board')}:</strong> {board}</div>
                        <div><strong>{renderBengaliLabel('Class')}:</strong> {className}</div>
                        <div><strong>{renderBengaliLabel('Full Marks')}:</strong> {totalMarks}</div>
                        <div><strong>{renderBengaliLabel('Duration')}:</strong> {practiceSet.duration || totalMarks} minutes</div>
                    </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                        <div><strong>{renderBengaliLabel('Book Name')}:</strong> {textbookTitle}</div>
                        <div><strong>{renderBengaliLabel('Subject')}:</strong> {subject}</div>
                        <div><strong>{renderBengaliLabel('Chapter')}:</strong> {chapterTitle}</div>
                        <div><strong>{renderBengaliLabel('Date')}:</strong> {new Date().toLocaleDateString()}</div>
                    </div>
                </div>
                <h4 style={{ fontSize: '18px', textAlign: 'center', marginBottom: '20px' }}>
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
        </div>
    );
};
