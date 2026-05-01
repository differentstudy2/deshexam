
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Textbook, Chapter, Topic, Question, Exam } from '@/lib/types';
import { getPracticeSetById, getQuestionsByPracticeSet, getContentById } from '@/lib/firebase/firestore';
import PracticeSetClientPage from '@/app/textbook-solutions/practice-set/[practiceSetId]/textbook/[bookId]/chapter/[chapterId]/topic/[topicId]/practice-set-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

type PageProps = {
  params: {
    examId: string;
    bookId: string;
  };
};

const serializeFirestoreTimestamps = (data: any): any => {
    if (!data) return data;
    if (Array.isArray(data)) {
        return data.map(item => serializeFirestoreTimestamps(item));
    }
    if (typeof data === 'object' && data !== null) {
        if (data.hasOwnProperty('seconds') && data.hasOwnProperty('nanoseconds') && typeof (data as any).toDate === 'function') {
            return (data as any).toDate().toISOString();
        }
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            newObj[key] = serializeFirestoreTimestamps(data[key]);
        }
        return newObj;
    }
    return data;
};

async function getPageData(params: PageProps['params']) {
    const { examId, bookId } = params;
    try {
        const exam = await getContentById(examId);
        const textbook = await getContentById(bookId);
        
        return { 
            exam: serializeFirestoreTimestamps(exam),
            textbook: serializeFirestoreTimestamps(textbook), 
        };
    } catch (error) {
        console.error("Error fetching data for metadata:", error);
        return { exam: null, textbook: null };
    }
}

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { textbook, exam } = await getPageData(params);

  if (!exam || !textbook) {
    return {
      title: 'Exam Not Found',
    };
  }

  const examTitle = formatTitleForBrowser((exam as any).title);
  const textbookTitle = formatTitleForBrowser((textbook as any).title);

  const title = `${examTitle} | ${textbookTitle} | DeshExam`;
  const description = `Take the exam "${examTitle}" for the ${textbookTitle} textbook. Test your knowledge with official questions and prepare effectively for your exams with DeshExam.`;
  const keywords = [
    (exam as any).title,
    textbook.title,
    (textbook as any).subject,
    'exam',
    'online test',
    'previous year paper',
    `${textbook.title} solutions`,
    `${textbook.subject} exam`,
  ].filter(Boolean);

  const imageUrl = (textbook as any).featureImage || `https://picsum.photos/seed/${params.examId}/1200/630`;

  return {
    title,
    description,
    keywords,
    openGraph: {
        title,
        description,
        url: `https://deshexam.com/textbook-solutions/exam/${params.examId}/textbook/${params.bookId}`,
        images: [
            {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: title,
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
    },
  };
}


export default async function TextbookExamPage({ params }: PageProps) {
    const { exam, textbook } = await getPageData(params);
    
    if (!exam || !textbook) {
        notFound();
    }
    
    const initialTest = {
        ...(exam as any),
        testType: 'Exam'
    };

    const mockChapter: Chapter = { id: 'null', title: 'Full Textbook', topics: [] , access: 'free'};
    const mockTopic: Topic | null = null;
    const cleanTitle = formatTitleForBrowser(initialTest.title);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Quiz",
      "name": cleanTitle,
      "description": formatTitleForBrowser(initialTest.description),
      "url": `https://deshexam.com/textbook-solutions/exam/${params.examId}/textbook/${params.bookId}`,
      'hasPart': (initialTest.questions || []).map((q: any) => {
          const cleanQuestionText = formatTitleForBrowser(q.text);
          const questionObj: any = {
              '@type': 'Question',
              'name': cleanQuestionText.substring(0, 100),
              'text': cleanQuestionText,
          };

          if (q.type === 'Multiple Choice' || q.type === 'True/False') {
              questionObj.suggestedAnswer = (q.options || []).map((opt: any) => ({
                  '@type': 'Answer',
                  'text': formatTitleForBrowser(opt.text)
              }));
              questionObj.acceptedAnswer = {
                  '@type': 'Answer',
                  'text': formatTitleForBrowser(q.correctAnswer)
              };
          } else {
              questionObj.acceptedAnswer = {
                  '@type': 'Answer',
                  'text': formatTitleForBrowser(q.correctAnswer)
              };
          }
          return questionObj;
      })
    };


    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            }>
                <PracticeSetClientPage 
                    initialTest={initialTest as any} 
                    initialTextbook={textbook as any} 
                    initialChapter={mockChapter}
                    initialTopic={mockTopic}
                />
            </Suspense>
        </>
    )
}
