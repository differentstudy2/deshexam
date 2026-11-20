import { Metadata } from 'next';
import { getFaqsServer, getCategoriesServer } from '@/features/faqs/services/faq-server.api';
import { FAQClient } from '@/features/faqs/components/faq-client';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions | DeshExam',
    description: 'Find answers to commonly asked questions about DeshExam, the largest open educational platform in the country. Learn about our features, mock tests, and more.',
    openGraph: {
        title: 'Frequently Asked Questions | DeshExam',
        description: 'Find answers to commonly asked questions about DeshExam, the largest open educational platform in the country. Learn about our features, mock tests, and more.',
        type: 'website',
    }
};

export default async function FAQServerPage() {
    // Fetch data perfectly on the server using Admin SDK
    const faqs = await getFaqsServer();
    const categories = await getCategoriesServer();

    // Generate strict FAQPage JSON-LD schema for Google Rich Snippets
    // We filter out any FAQs that might not have a question or answer just in case.
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.filter(faq => faq.question && faq.answer).map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* We pass the server-fetched data to our highly interactive Client Component */}
            <FAQClient initialFaqs={faqs} categoriesData={categories} />
        </>
    );
}
