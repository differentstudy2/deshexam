
import type { Metadata } from 'next';
import TextbookSolutionsListPage from './textbook-solutions-client';

export const metadata: Metadata = {
  title: 'Textbook Solutions | Step-by-Step Answers for NCERT, CBSE & More | DeshExam',
  description: "Find free and comprehensive solutions for your school textbooks. Covers all subjects and boards like NCERT, CBSE, etc. Get step-by-step answers to ace your exams.",
  keywords: ['textbook solutions', 'ncert solutions', 'cbse solutions', 'free textbook solutions', 'exam preparation', 'homework help'],
};

export default function TextbookSolutionsPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Textbook Solutions | DeshExam",
        "description": "Find free and comprehensive solutions for your school and competitive exam textbooks.",
        "url": "https://deshexam.com/textbook-solutions"
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TextbookSolutionsListPage />
        </>
    );
}
