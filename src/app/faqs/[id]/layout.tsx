import { Metadata } from 'next';
import { getFaqBySlugOrIdServer as getFaqBySlugOrId } from '@/features/faqs/services/faq-server.api';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    try {
        const faq = await getFaqBySlugOrId(params.id);

        if (!faq) {
            return {
                title: 'FAQ Not Found | DeshExam',
            };
        }

        const title = faq.seo?.metaTitle || faq.question;
        const description = faq.seo?.metaDescription || faq.answer.substring(0, 160).trim() + '...';
        // User requested a default OpenGraph image fallback
        const defaultOgImage = '/og-image.jpg'; 

        return {
            title: `${title} | DeshExam FAQ`,
            description,
            openGraph: {
                title,
                description,
                type: 'article',
                images: [defaultOgImage],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [defaultOgImage],
            }
        };
    } catch (error) {
        return {
            title: 'FAQ | DeshExam',
        };
    }
}

export default async function FAQLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    let faq = null;
    try {
        faq = await getFaqBySlugOrId(params.id);
    } catch (error) {
        console.error("Failed to fetch FAQ for layout:", error);
    }

    // Default to true as per user's request (injecting on all FAQs by default)
    const schemaEnabled = faq ? (faq.seo?.schemaEnabled !== false) : false;

    return (
        <>
            {schemaEnabled && faq && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": faq.question,
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": faq.answer
                                    }
                                }
                            ]
                        })
                    }}
                />
            )}
            {children}
        </>
    );
}
