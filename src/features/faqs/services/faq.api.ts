import { FAQ, FAQFilters, CreateFAQDTO, UpdateFAQDTO, FAQCategory, FAQTag } from '../types/faq.types';

import { db } from "@/lib/firebase/client";
import { collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, writeBatch, query, orderBy, increment } from "firebase/firestore";
const FAQS_COLLECTION = "faqs";
const CATEGORIES_COLLECTION = "faq_categories";
const TAGS_COLLECTION = "faq_tags";

export const getFaqs = async (filters?: FAQFilters): Promise<FAQ[]> => {
  const q = query(collection(db, FAQS_COLLECTION));
  const snapshot = await getDocs(q);
  
  let result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FAQ));

  if (filters) {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(f => 
        f.question?.toLowerCase().includes(s) || 
        f.answer?.toLowerCase().includes(s) ||
        (f.tags && f.tags.some(t => t.toLowerCase().includes(s)))
      );
    }
    if (filters.categoryId && filters.categoryId !== "all") {
      result = result.filter(f => f.categoryId === filters.categoryId);
    }
    if (filters.status && filters.status !== "all" as any) {
      result = result.filter(f => f.status === filters.status);
    }
    if (filters.tag && filters.tag !== "all") {
      result = result.filter(f => f.tags && f.tags.includes(filters.tag!));
    }

    if (filters.sortBy) {
      switch(filters.sortBy) {
        case "latest":
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "oldest":
          result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case "most_viewed":
          result.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        case "alphabetical":
          result.sort((a, b) => (a.question || "").localeCompare(b.question || ""));
          break;
      }
    } else {
        result.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } else {
      result.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  return result;
};

export const getFaqById = async (id: string): Promise<FAQ | null> => {
  const snapshot = await getDocs(collection(db, FAQS_COLLECTION));
  const doc = snapshot.docs.find(d => d.id === id);
  return doc ? ({ id: doc.id, ...doc.data() } as FAQ) : null;
};

export const getFaqBySlugOrId = async (identifier: string): Promise<FAQ | null> => {
  const snapshot = await getDocs(collection(db, FAQS_COLLECTION));
  // Find by slug first
  let doc = snapshot.docs.find(d => {
    const data = d.data();
    return data.seo?.slug === identifier;
  });
  
  // Fallback to id
  if (!doc) {
    doc = snapshot.docs.find(d => d.id === identifier);
  }
  
  return doc ? ({ id: doc.id, ...doc.data() } as FAQ) : null;
};

export const createFaq = async (data: CreateFAQDTO): Promise<FAQ> => {
  const newFaqData = {
    ...data,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, FAQS_COLLECTION), newFaqData);
  return { id: docRef.id, ...newFaqData } as FAQ;
};

export const bulkCreateFaqs = async (faqs: CreateFAQDTO[]): Promise<FAQ[]> => {
  const batch = writeBatch(db);
  const newFaqs: FAQ[] = [];

  faqs.forEach((faq) => {
    const docRef = doc(collection(db, FAQS_COLLECTION));
    const faqData = {
      ...faq,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    batch.set(docRef, faqData);
    newFaqs.push({ id: docRef.id, ...faqData } as FAQ);
  });

  await batch.commit();
  return newFaqs;
};

export const updateFaq = async (id: string, data: UpdateFAQDTO): Promise<FAQ> => {
  const faqRef = doc(db, FAQS_COLLECTION, id);
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  await updateDoc(faqRef, updateData);
  return { id, ...updateData } as FAQ;
};

export const deleteFaq = async (id: string): Promise<boolean> => {
  await deleteDoc(doc(db, FAQS_COLLECTION, id));
  return true;
};

export const bulkDeleteFaqs = async (ids: string[]): Promise<boolean> => {
  const batch = writeBatch(db);
  ids.forEach(id => {
    batch.delete(doc(db, FAQS_COLLECTION, id));
  });
  await batch.commit();
  return true;
};

export const bulkUpdateFaqs = async (ids: string[], data: UpdateFAQDTO): Promise<boolean> => {
  if (ids.length === 0) return false;
  
  const batch = writeBatch(db);
  const updateData: Record<string, any> = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  if (typeof data.views === "number") {
    updateData.views = increment(data.views);
  }
  if (typeof data.helpfulVotes === "number") {
    updateData.helpfulVotes = increment(data.helpfulVotes);
  }
  if (typeof data.unhelpfulVotes === "number") {
    updateData.unhelpfulVotes = increment(data.unhelpfulVotes);
  }

  ids.forEach(id => {
    batch.update(doc(db, FAQS_COLLECTION, id), updateData);
  });
  
  await batch.commit();
  return true;
};

export const reorderFaqs = async (updates: { id: string, order: number }[]): Promise<boolean> => {
  const batch = writeBatch(db);
  updates.forEach(update => {
    batch.update(doc(db, FAQS_COLLECTION, update.id), { order: update.order });
  });
  await batch.commit();
  return true;
};

export const getCategories = async (): Promise<FAQCategory[]> => {
  const snapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FAQCategory));
};

export const createCategory = async (data: Omit<FAQCategory, "id">): Promise<FAQCategory> => {
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), data);
  return { id: docRef.id, ...data };
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
  return true;
};

export const getTags = async (): Promise<FAQTag[]> => {
  const snapshot = await getDocs(collection(db, TAGS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FAQTag));
};

export const createTag = async (name: string): Promise<FAQTag> => {
  const docRef = await addDoc(collection(db, TAGS_COLLECTION), { name });
  return { id: docRef.id, name };
};

export const deleteTag = async (id: string): Promise<boolean> => {
  await deleteDoc(doc(db, TAGS_COLLECTION, id));
  return true;
};
