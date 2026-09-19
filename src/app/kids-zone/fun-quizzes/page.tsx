
import type { Metadata } from 'next';
import FunQuizzesClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Fun Quizzes for Kids | General Knowledge, Animals, Science | DeshExam',
  description: "Boost your child's knowledge with fun and educational quizzes! Explore exciting topics like general knowledge (GK), animals, science, and more. Perfect for kids to learn and play.",
  keywords: ['fun quizzes for kids', 'kids quiz', 'general knowledge for kids', 'gk questions for kids', 'science quiz for kids', 'animal quiz for kids', 'educational games'],
};

export default function FunQuizzesPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Fun Quizzes for Kids | DeshExam",
        "description": "Boost your child's knowledge with fun and educational quizzes on a variety of topics.",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/kids-zone/fun-quizzes`
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <FunQuizzesClientPage />
        </>
    );
}
