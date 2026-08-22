import { db } from "@/lib/firebase/client";
import { collection, query, orderBy, getDocs, doc, getDoc, where, setDoc, deleteDoc } from "firebase/firestore";

// --- Types ---
export interface GuideClass {
  id: string;
  name: string;
  slug: string;
  orderIndex: number;
  status: 'draft' | 'published';
}

export interface GuideSubject {
  id: string;
  classId: string;
  name: string;
  slug: string;
  orderIndex: number;
  status: 'draft' | 'published';
}

export interface GuideTextbook {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  thumbnail: string;
  orderIndex: number;
  status: 'draft' | 'published';
}

export interface GuideChapter {
  id: string;
  textbookId: string;
  name: string;
  slug: string;
  orderIndex: number;
  status: 'draft' | 'published';
}

export interface GuideTopic {
  id: string;
  chapterId: string;
  name: string;
  slug: string;
  thumbnail: string;
  orderIndex: number;
  status: 'draft' | 'published';
}

export interface GuideContentSection {
  id: string;
  topicId: string;
  type: string;
  title: string;
  content: any;
  sortOrder: number;
  status: 'draft' | 'published';
}

// --- Fetch Functions ---

export const getGuideClasses = async (): Promise<GuideClass[]> => {
  const q = query(collection(db, "guide_classes"), orderBy("orderIndex", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GuideClass));
};

export const getSubjectsByClass = async (classId: string): Promise<GuideSubject[]> => {
  const q = query(collection(db, "guide_subjects"), where("classId", "==", classId), orderBy("orderIndex", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GuideSubject));
};

export const getTextbooksBySubject = async (subjectId: string): Promise<GuideTextbook[]> => {
  const q = query(collection(db, "guide_textbooks"), where("subjectId", "==", subjectId), orderBy("orderIndex", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GuideTextbook));
};

export const getChaptersByTextbook = async (textbookId: string): Promise<GuideChapter[]> => {
  const q = query(collection(db, "guide_chapters_v2"), where("textbookId", "==", textbookId), orderBy("orderIndex", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GuideChapter));
};

export const getTopicsByChapter = async (chapterId: string): Promise<GuideTopic[]> => {
  const q = query(collection(db, "guide_topics_v2"), where("chapterId", "==", chapterId), orderBy("orderIndex", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GuideTopic));
};

export const getContentSectionsByTopic = async (topicId: string): Promise<GuideContentSection[]> => {
  const q = query(collection(db, "guide_content_sections"), where("topicId", "==", topicId), orderBy("sortOrder", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GuideContentSection));
};

// --- Write Functions ---

export const saveGuideClass = async (id: string, data: Partial<GuideClass>) => {
  await setDoc(doc(db, "guide_classes", id), data, { merge: true });
};
export const deleteGuideClass = async (id: string) => {
  await deleteDoc(doc(db, "guide_classes", id));
};

export const saveGuideSubject = async (id: string, data: Partial<GuideSubject>) => {
  await setDoc(doc(db, "guide_subjects_v2", id), data, { merge: true }); // using v2 to avoid conflicts with old guide_subjects
};
export const deleteGuideSubject = async (id: string) => {
  await deleteDoc(doc(db, "guide_subjects_v2", id));
};

export const saveGuideTextbook = async (id: string, data: Partial<GuideTextbook>) => {
  await setDoc(doc(db, "guide_textbooks", id), data, { merge: true });
};
export const deleteGuideTextbook = async (id: string) => {
  await deleteDoc(doc(db, "guide_textbooks", id));
};

export const saveGuideChapter = async (id: string, data: Partial<GuideChapter>) => {
  await setDoc(doc(db, "guide_chapters_v2", id), data, { merge: true });
};
export const deleteGuideChapter = async (id: string) => {
  await deleteDoc(doc(db, "guide_chapters_v2", id));
};

export const saveGuideTopic = async (id: string, data: Partial<GuideTopic>) => {
  await setDoc(doc(db, "guide_topics_v2", id), data, { merge: true });
};
export const deleteGuideTopic = async (id: string) => {
  await deleteDoc(doc(db, "guide_topics_v2", id));
};

export const saveContentSection = async (id: string, data: Partial<GuideContentSection>) => {
  await setDoc(doc(db, "guide_content_sections", id), data, { merge: true });
};
export const deleteContentSection = async (id: string) => {
  await deleteDoc(doc(db, "guide_content_sections", id));
};
