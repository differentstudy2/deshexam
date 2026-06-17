import { collection, query, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

// ==========================================
// COURSE TYPES & HELPERS
// ==========================================
export interface InstitutionCourse {
  id?: string;
  courseName: string;
  degreeType?: string;
  duration?: string;
  annualFees?: string;
  totalSeats?: string;
  eligibility?: string;
  description?: string;
  featured?: boolean;
  active?: boolean;
  orderIndex?: number;
  createdAt?: any;
  updatedAt?: any;
}

export const getInstitutionCourses = async (institutionId: string): Promise<InstitutionCourse[]> => {
  const q = query(collection(db, 'taxonomy_nodes', institutionId, 'courses'), orderBy('orderIndex', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InstitutionCourse));
};

export const addInstitutionCourse = async (institutionId: string, data: Omit<InstitutionCourse, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newRef = doc(collection(db, 'taxonomy_nodes', institutionId, 'courses'));
  await setDoc(newRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    orderIndex: data.orderIndex ?? Date.now()
  });
  return newRef.id;
};

export const updateInstitutionCourse = async (institutionId: string, courseId: string, data: Partial<InstitutionCourse>) => {
  const docRef = doc(db, 'taxonomy_nodes', institutionId, 'courses', courseId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteInstitutionCourse = async (institutionId: string, courseId: string) => {
  await deleteDoc(doc(db, 'taxonomy_nodes', institutionId, 'courses', courseId));
};

// ==========================================
// FAQ TYPES & HELPERS
// ==========================================
export interface InstitutionFaq {
  id?: string;
  question: string;
  answer: string;
  sortOrder?: number;
  createdAt?: any;
  updatedAt?: any;
}

export const getInstitutionFaqs = async (institutionId: string): Promise<InstitutionFaq[]> => {
  const q = query(collection(db, 'taxonomy_nodes', institutionId, 'faqs'), orderBy('sortOrder', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InstitutionFaq));
};

export const addInstitutionFaq = async (institutionId: string, data: Omit<InstitutionFaq, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newRef = doc(collection(db, 'taxonomy_nodes', institutionId, 'faqs'));
  await setDoc(newRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    sortOrder: data.sortOrder ?? Date.now()
  });
  return newRef.id;
};

export const updateInstitutionFaq = async (institutionId: string, faqId: string, data: Partial<InstitutionFaq>) => {
  const docRef = doc(db, 'taxonomy_nodes', institutionId, 'faqs', faqId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteInstitutionFaq = async (institutionId: string, faqId: string) => {
  await deleteDoc(doc(db, 'taxonomy_nodes', institutionId, 'faqs', faqId));
};

// ==========================================
// SCHOLARSHIP TYPES & HELPERS
// ==========================================
export interface InstitutionScholarship {
  id?: string;
  scholarshipName: string;
  amount?: string;
  eligibility?: string;
  description?: string;
  deadline?: string;
  orderIndex?: number;
  createdAt?: any;
  updatedAt?: any;
}

export const getInstitutionScholarships = async (institutionId: string): Promise<InstitutionScholarship[]> => {
  const q = query(collection(db, 'taxonomy_nodes', institutionId, 'scholarships'), orderBy('orderIndex', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InstitutionScholarship));
};

export const addInstitutionScholarship = async (institutionId: string, data: Omit<InstitutionScholarship, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newRef = doc(collection(db, 'taxonomy_nodes', institutionId, 'scholarships'));
  await setDoc(newRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    orderIndex: data.orderIndex ?? Date.now()
  });
  return newRef.id;
};

export const updateInstitutionScholarship = async (institutionId: string, scholarshipId: string, data: Partial<InstitutionScholarship>) => {
  const docRef = doc(db, 'taxonomy_nodes', institutionId, 'scholarships', scholarshipId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteInstitutionScholarship = async (institutionId: string, scholarshipId: string) => {
  await deleteDoc(doc(db, 'taxonomy_nodes', institutionId, 'scholarships', scholarshipId));
};
