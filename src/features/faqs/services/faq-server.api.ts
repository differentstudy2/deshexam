import { adminDb } from '@/lib/firebase/admin';
import { FAQ, FAQCategory } from '@/features/faqs/types/faq.types';
const FAQS_COLLECTION = 'faqs';
const CATEGORIES_COLLECTION = 'faq_categories';
export async function getFaqsServer(): Promise<FAQ[]> {
    if (!adminDb) return [];
    try {
        const snapshot = await adminDb.collection(FAQS_COLLECTION).orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            } as unknown as FAQ;
        });
    } catch (error) {
        console.error('Error fetching FAQs on server:', error);
        return [];
    }
}

export async function getCategoriesServer(): Promise<FAQCategory[]> {
    if (!adminDb) return [];
    try {
        const snapshot = await adminDb.collection(CATEGORIES_COLLECTION).orderBy('order', 'asc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            } as unknown as FAQCategory;
        });
    } catch (error) {
        console.error('Error fetching Categories on server:', error);
        return [];
    }
}
