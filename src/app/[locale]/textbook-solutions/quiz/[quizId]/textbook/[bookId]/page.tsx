
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Textbook, Chapter, Exam as Quiz, Topic } from '@/lib/types';
import { getContentById, getTextbookById } from '@/lib/firebase/firestore';
import PracticeSetClientPage from '@/app/[locale]/textbook-solutions/practice-set/[practiceSetId]/textbook/[bookId]/chapter/[chapterId]/topic/[topicId]/practice-set-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

type PageProps = {
  params: {
    quizId: string;
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
    const { quizId, bookId } = params;
    try {
        const quiz = await getContentById(quizId);
        const textbook = await getTextbookById(bookId);
        
        return { 
            quiz: serializeFirestoreTimestamps(quiz),
            textbook: serializeFirestoreTimestamps(textbook), 
        };
    } catch (error) {
        console.error("Error fetching data for metadata:", error);
        return { quiz: null, textbook: null };
    }
}

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { textbook, quiz } = await getPageData(params);

  if (!quiz || !textbook) {
    return {
      title: 'Quiz Not Found',
    };
  }

  const quizTitle = formatTitleForBrowser((quiz as any).title);
  const textbookTitle = formatTitleForBrowser((textbook as any).title);

  const title = `${quizTitle} | ${textbookTitle} | DeshExam`;
  const description = `Take the quiz "${quizTitle}" for the ${textbookTitle} textbook. Test your knowledge and prepare for your exams with DeshExam.`;
  const keywords = [
    (quiz as any).title,
    textbook.title,
    (textbook as any).subject,
    'quiz',
    'online test',
    'practice quiz',
    `${textbook.title} solutions`,
    `${textbook.subject} quiz`,
  ].filter(Boolean);

   const imageUrl = (textbook as any).featureImage || `https://picsum.photos/seed/${params.quizId}/1200/630`;

  return {
    title,
    description,
    keywords,
    openGraph: {
        title,
        description,
        url: `https://deshexam.com/textbook-solutions/quiz/${params.quizId}/textbook/${params.bookId}`,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
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


export default async function TextbookQuizPage({ params }: PageProps) {
    const { quiz, textbook } = await getPageData(params);
    
    if (!quiz || !textbook) {
        notFound();
    }
    
    const initialTest = {
        ...(quiz as any),
        testType: 'Quiz'
    };

    const mockChapter: Chapter = { id: 'null', title: 'Full Textbook', topics: [] , access: 'free'};
    const mockTopic: null = null;
    const cleanTitle = formatTitleForBrowser(initialTest.title);
    
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        "name": cleanTitle,
        "description": formatTitleForBrowser(initialTest.description),
        "learningResourceType": "Quiz",
        "educationalLevel": textbook.class || 'All Levels',
        "about": {
          "@type": "Thing",
          "name": textbook.subject
        },
        "author": {
          "@type": "Organization",
          "name": "DeshExam"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://deshexam.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Textbook Solutions",
            "item": "https://deshexam.com/textbook-solutions"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": textbook.title,
            "item": `https://deshexam.com/textbook-solutions/${textbook.id}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": cleanTitle,
            "item": `https://deshexam.com/textbook-solutions/quiz/${params.quizId}/textbook/${params.bookId}`
          }
        ]
      }
    ];

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
