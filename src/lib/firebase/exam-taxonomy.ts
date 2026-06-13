import { db } from './client';
import { 
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, writeBatch
} from 'firebase/firestore';

// --- Interfaces ---
export interface ExamCategory { id: string; name: string; slug: string; icon?: string; status: 'active' | 'inactive'; createdAt?: any; }
export interface ExamSubCategory { id: string; categoryId: string; name: string; slug: string; status: 'active' | 'inactive'; createdAt?: any; }
export interface TaxonomyExam { id: string; categoryId: string; subCategoryId: string; name: string; slug: string; icon?: string; description?: string; status: 'active' | 'inactive'; createdAt?: any; }
export interface ExamSubject { id: string; examId: string; name: string; createdAt?: any; }
export interface ExamChapter { id: string; subjectId: string; name: string; createdAt?: any; }
export interface ExamTopic { id: string; chapterId: string; name: string; createdAt?: any; }

// --- CRUD Operations ---
// 1. Categories
export const getCategories = async (): Promise<ExamCategory[]> => {
  const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as ExamCategory));
};
export const addCategory = async (data: Omit<ExamCategory, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
};
export const updateCategory = async (id: string, data: Partial<ExamCategory>) => { await updateDoc(doc(db, 'categories', id), data); };
export const deleteCategory = async (id: string) => { await deleteDoc(doc(db, 'categories', id)); };

// 2. Subcategories
export const getSubcategories = async (categoryId?: string): Promise<ExamSubCategory[]> => {
  let q = collection(db, 'subcategories') as any;
  if (categoryId) q = query(q, where('categoryId', '==', categoryId), orderBy('name', 'asc'));
  else q = query(q, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as ExamSubCategory));
};
export const addSubcategory = async (data: Omit<ExamSubCategory, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'subcategories'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
};
export const updateSubcategory = async (id: string, data: Partial<ExamSubCategory>) => { await updateDoc(doc(db, 'subcategories', id), data); };
export const deleteSubcategory = async (id: string) => { await deleteDoc(doc(db, 'subcategories', id)); };

// 3. Exams
export const getExams = async (subCategoryId?: string): Promise<TaxonomyExam[]> => {
  let q = collection(db, 'exams') as any;
  if (subCategoryId) q = query(q, where('subCategoryId', '==', subCategoryId), orderBy('name', 'asc'));
  else q = query(q, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as TaxonomyExam));
};
export const addExam = async (data: Omit<TaxonomyExam, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'exams'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
};
export const updateExam = async (id: string, data: Partial<TaxonomyExam>) => { await updateDoc(doc(db, 'exams', id), data); };
export const deleteExam = async (id: string) => { await deleteDoc(doc(db, 'exams', id)); };

// 4. Subjects
export const getSubjects = async (examId?: string): Promise<ExamSubject[]> => {
  let q = collection(db, 'subjects') as any;
  if (examId) q = query(q, where('examId', '==', examId), orderBy('name', 'asc'));
  else q = query(q, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as ExamSubject));
};
export const addSubject = async (data: Omit<ExamSubject, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'subjects'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
};
export const updateSubject = async (id: string, data: Partial<ExamSubject>) => { await updateDoc(doc(db, 'subjects', id), data); };
export const deleteSubject = async (id: string) => { await deleteDoc(doc(db, 'subjects', id)); };

// 5. Chapters
export const getChapters = async (subjectId?: string): Promise<ExamChapter[]> => {
  let q = collection(db, 'chapters') as any;
  if (subjectId) q = query(q, where('subjectId', '==', subjectId), orderBy('name', 'asc'));
  else q = query(q, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as ExamChapter));
};
export const addChapter = async (data: Omit<ExamChapter, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'chapters'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
};
export const updateChapter = async (id: string, data: Partial<ExamChapter>) => { await updateDoc(doc(db, 'chapters', id), data); };
export const deleteChapter = async (id: string) => { await deleteDoc(doc(db, 'chapters', id)); };

// 6. Topics
export const getTopics = async (chapterId?: string): Promise<ExamTopic[]> => {
  let q = collection(db, 'topics') as any;
  if (chapterId) q = query(q, where('chapterId', '==', chapterId), orderBy('name', 'asc'));
  else q = query(q, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as ExamTopic));
};
export const addTopic = async (data: Omit<ExamTopic, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'topics'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
};
export const updateTopic = async (id: string, data: Partial<ExamTopic>) => { await updateDoc(doc(db, 'topics', id), data); };
export const deleteTopic = async (id: string) => { await deleteDoc(doc(db, 'topics', id)); };

// --- Bulk Import ---
export const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export interface BulkImportData {
  name: string;
  subcategories?: {
    name: string;
    exams?: {
      name: string;
      subjects?: {
        name: string;
        chapters?: {
          name: string;
          topics?: (string | { name: string })[]
        }[]
      }[]
    }[]
  }[];
}

export const importCustomTaxonomy = async (data: BulkImportData[]) => {
  let currentBatch = writeBatch(db);
  let operationCount = 0;
  
  const commitBatch = async () => {
    if (operationCount > 0) {
      await currentBatch.commit();
      currentBatch = writeBatch(db);
      operationCount = 0;
    }
  };

  const addOperation = async (operation: (b: any) => void) => {
    operation(currentBatch);
    operationCount++;
    if (operationCount >= 490) await commitBatch();
  };

  for (const cat of data) {
    const catRef = doc(collection(db, 'categories'));
    await addOperation((b) => b.set(catRef, { name: cat.name, slug: generateSlug(cat.name), status: 'active', createdAt: serverTimestamp() }));

    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        const subRef = doc(collection(db, 'subcategories'));
        await addOperation((b) => b.set(subRef, { categoryId: catRef.id, name: sub.name, slug: generateSlug(sub.name), status: 'active', createdAt: serverTimestamp() }));

        if (sub.exams) {
          for (const exam of sub.exams) {
            const examRef = doc(collection(db, 'exams'));
            await addOperation((b) => b.set(examRef, { categoryId: catRef.id, subCategoryId: subRef.id, name: exam.name, slug: generateSlug(exam.name), status: 'active', createdAt: serverTimestamp() }));

            if (exam.subjects) {
              for (const subj of exam.subjects) {
                const subjRef = doc(collection(db, 'subjects'));
                await addOperation((b) => b.set(subjRef, { examId: examRef.id, name: subj.name, createdAt: serverTimestamp() }));

                if (subj.chapters) {
                  for (const chapter of subj.chapters) {
                    const chapterRef = doc(collection(db, 'chapters'));
                    await addOperation((b) => b.set(chapterRef, { subjectId: subjRef.id, name: chapter.name, createdAt: serverTimestamp() }));

                    if (chapter.topics) {
                      for (const topic of chapter.topics) {
                        const topicName = typeof topic === 'string' ? topic : topic.name;
                        const topicRef = doc(collection(db, 'topics'));
                        await addOperation((b) => b.set(topicRef, { chapterId: chapterRef.id, name: topicName, createdAt: serverTimestamp() }));
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  await commitBatch();
};

export const clearTaxonomy = async () => {
  const collections = ['categories', 'subcategories', 'exams', 'subjects', 'chapters', 'topics'];
  for (const collName of collections) {
    const snapshot = await getDocs(collection(db, collName));
    let currentBatch = writeBatch(db);
    let opCount = 0;
    
    for (const d of snapshot.docs) {
      currentBatch.delete(d.ref);
      opCount++;
      if (opCount >= 490) {
        await currentBatch.commit();
        currentBatch = writeBatch(db);
        opCount = 0;
      }
    }
    if (opCount > 0) await currentBatch.commit();
  }
};

export const bulkImportTaxonomy = async () => {
  const PRESET_TAXONOMY_DATA = [
    {
      "name": "Government Jobs",
      "subcategories": [
        {
          "name": "SSC",
          "exams": [
            {
              "name": "SSC CGL",
              "subjects": [
                {
                  "name": "Mathematics",
                  "chapters": [
                    {
                      "name": "Arithmetic",
                      "topics": ["Profit & Loss", "Percentages"]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Board Education",
      "subcategories": [
        {
          "name": "WBBSE",
          "exams": [
            {
              "name": "Class 10",
              "subjects": [
                {
                  "name": "Mathematics",
                  "chapters": [
                    {
                      "name": "Algebra",
                      "topics": ["Quadratic Equation"]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ] as BulkImportData[];

  await clearTaxonomy();
  await importCustomTaxonomy(PRESET_TAXONOMY_DATA);
};
