import { db } from "@/lib/firebase/client";
import { collection, query, orderBy, getDocs, doc, getDoc, where, setDoc, deleteDoc, getCountFromServer, serverTimestamp, addDoc } from "firebase/firestore";
import { SidebarSubject, Chapter, ReadingContentData } from "@/app/guide/[id]/guide-data"; // Types

export const getGuideSubjects = async (): Promise<SidebarSubject[]> => {
  try {
    const q = query(collection(db, "guide_subjects"), orderBy("orderIndex", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      countStr: doc.data().countStr,
    })) as SidebarSubject[];
  } catch (error) {
    console.error("Error fetching guide subjects:", error);
    return [];
  }
};

export const getCurriculumBySubject = async (subjectId: string): Promise<Chapter[]> => {
  try {
    // New Hierarchy: Subject -> Textbooks -> Chapters -> Topics
    
    // 1. Fetch Textbooks for this subject
    const textbooksQuery = query(collection(db, "guide_textbooks"), where("subjectId", "==", subjectId));
    const textbooksSnap = await getDocs(textbooksQuery);
    
    if (textbooksSnap.empty) {
      // Fallback for old mock structure (just in case)
      const chaptersQuery = query(collection(db, "guide_chapters"), where("subjectId", "==", subjectId));
      const chaptersSnap = await getDocs(chaptersQuery);
      if (chaptersSnap.empty) return [];

      const topicsQuery = query(collection(db, "guide_topics"), where("subjectId", "==", subjectId));
      const topicsSnap = await getDocs(topicsQuery);
      const topicsByChapterId: Record<string, any[]> = {};
      topicsSnap.forEach(doc => {
        const data = doc.data();
        if (!topicsByChapterId[data.chapterId]) topicsByChapterId[data.chapterId] = [];
        topicsByChapterId[data.chapterId].push({ id: doc.id, title: data.title, type: 'topic', subtopics: data.subtopics || [] });
      });

      return chaptersSnap.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        topics: topicsByChapterId[doc.id] || []
      }));
    }

    // 2. Fetch Chapters for these textbooks
    const textbookIds = textbooksSnap.docs.map(doc => doc.id);
    const chaptersQuery = query(collection(db, "guide_chapters"), where("textbookId", "in", textbookIds.length > 0 ? textbookIds : ['temp']));
    const chaptersSnap = await getDocs(chaptersQuery);
    
    // 3. Fetch Topics for these chapters
    const chapterIds = chaptersSnap.docs.map(doc => doc.id);
    let topicsSnap = { docs: [] as any[] };
    if (chapterIds.length > 0) {
      // Note: Firestore 'in' query supports max 10 values, but for a typical subject, 
      // we'll chunk it if it gets large. For now, fetch all topics and filter in-memory if needed.
      const tQuery = query(collection(db, "guide_topics"));
      topicsSnap = await getDocs(tQuery) as any;
    }

    const topicsByChapterId: Record<string, any[]> = {};
    topicsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (chapterIds.includes(data.chapterId)) {
        if (!topicsByChapterId[data.chapterId]) topicsByChapterId[data.chapterId] = [];
        topicsByChapterId[data.chapterId].push({ id: doc.id, title: data.title, type: 'topic' });
      }
    });

    const chaptersByTextbookId: Record<string, any[]> = {};
    chaptersSnap.docs.forEach(doc => {
      const data = doc.data();
      if (!chaptersByTextbookId[data.textbookId]) chaptersByTextbookId[data.textbookId] = [];
      chaptersByTextbookId[data.textbookId].push({
        id: doc.id,
        title: data.title,
        type: 'chapter',
        subtopics: topicsByChapterId[doc.id] || [] // Map Topics to Subtopics for the UI
      });
    });

    const curriculum: Chapter[] = textbooksSnap.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      topics: chaptersByTextbookId[doc.id] || [] // Map Chapters to Topics for the UI
    }));

    return curriculum;
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return [];
  }
};

export const getReadingContent = async (contentId: string): Promise<ReadingContentData | null> => {
  try {
    let topicDoc = await getDoc(doc(db, "guide_topics", contentId));
    let topicData = topicDoc.exists() ? topicDoc.data() : null;

    if (!topicData || !topicData.title) {
      const chapterDoc = await getDoc(doc(db, "guide_chapters", contentId));
      if (chapterDoc.exists()) {
        topicData = { ...topicData, ...chapterDoc.data() };
      }
    }

    const q = query(collection(db, "guide_topics", contentId, "content_sections"));
    const snap = await getDocs(q);
    const sections: any[] = [];
    snap.forEach(d => {
      sections.push({
        title: d.data().sectionType || d.id,
        type: 'article',
        body: d.data().content,
        author: {
          name: 'Sattar Uddin Sohel',
          avatarUrl: 'https://i.pravatar.cc/150?u=sattar'
        }
      });
    });

    if (topicData) {
      return {
        id: contentId,
        title: topicData.title || contentId,
        subtitle: 'Topic Content',
        sections: sections.length > 0 ? sections : [{ title: 'Overview', type: 'article', body: '<p>No content added yet.</p>', author: { name: 'System', avatarUrl: 'https://i.pravatar.cc/150' } }]
      } as ReadingContentData;
    } else {
      // Fallback
      const docRef = doc(db, "guide_reading_content", contentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ReadingContentData;
      }
      return null;
    }
  } catch (error) {
    console.error("Error fetching reading content:", error);
    return null;
  }
};

// --- Write Functions for Admin Manager ---

export const saveGuideSubject = async (id: string, data: any) => {
  await setDoc(doc(db, "guide_subjects", id), data);
};

export const deleteGuideSubject = async (id: string) => {
  await deleteDoc(doc(db, "guide_subjects", id));
};

export const saveGuideChapter = async (id: string, data: any) => {
  await setDoc(doc(db, "guide_chapters", id), data);
};

export const deleteGuideChapter = async (id: string) => {
  await deleteDoc(doc(db, "guide_chapters", id));
};

export const saveGuideTopic = async (id: string, data: any) => {
  await setDoc(doc(db, "guide_topics", id), data);
};

export const deleteGuideTopic = async (id: string) => {
  await deleteDoc(doc(db, "guide_topics", id));
};

export const saveGuideReadingContent = async (id: string, data: any) => {
  await setDoc(doc(db, "guide_reading_content", id), data);
};

export const deleteGuideReadingContent = async (id: string) => {
  await deleteDoc(doc(db, "guide_reading_content", id));
};

export const deleteGuideClass = async (id: string) => {
  await deleteDoc(doc(db, "guide_classes", id));
};

export const deleteGuideTextbook = async (id: string) => {
  await deleteDoc(doc(db, "guide_textbooks", id));
};

// --- NEW HIERARCHY FETCHERS ---

export const getGuideStats = async () => {
  try {
    const [classes, subjects, textbooks, chapters, topics] = await Promise.all([
      getCountFromServer(collection(db, 'guide_classes')),
      getCountFromServer(collection(db, 'guide_subjects')),
      getCountFromServer(collection(db, 'guide_textbooks')),
      getCountFromServer(collection(db, 'guide_chapters')),
      getCountFromServer(collection(db, 'guide_topics'))
    ]);
    return {
      classes: classes.data().count,
      subjects: subjects.data().count,
      textbooks: textbooks.data().count,
      chapters: chapters.data().count,
      topics: topics.data().count,
    };
  } catch (error) {
    console.error('Error fetching guide stats:', error);
    return { classes: 0, subjects: 0, textbooks: 0, chapters: 0, topics: 0 };
  }
};

export const getGuideClasses = async () => {
  const q = query(collection(db, 'guide_classes'));
  const snap = await getDocs(q);
  const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  return docs.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getGuideSubjectsByClass = async (classId: string) => {
  const q = query(collection(db, 'guide_subjects'), where('classId', '==', classId));
  const snap = await getDocs(q);
  const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  return docs.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getGuideTextbooksBySubject = async (subjectId: string) => {
  const q = query(collection(db, 'guide_textbooks'), where('subjectId', '==', subjectId));
  const snap = await getDocs(q);
  const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  return docs.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getGuideChaptersByTextbook = async (textbookId: string) => {
  const q = query(collection(db, 'guide_chapters'), where('textbookId', '==', textbookId));
  const snap = await getDocs(q);
  const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  return docs.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getGuideTopicsByChapter = async (chapterId: string) => {
  const q = query(collection(db, 'guide_topics'), where('chapterId', '==', chapterId));
  const snap = await getDocs(q);
  const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  return docs.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getTopicSections = async (topicId: string) => {
  const q = query(collection(db, 'guide_topics', topicId, 'content_sections'));
  const snap = await getDocs(q);
  const sections: Record<string, any> = {};
  snap.forEach(doc => {
    sections[doc.id] = doc.data();
  });
  return sections;
};

export const saveTopicSections = async (topicId: string, sections: Record<string, any>) => {
  const promises = Object.entries(sections).map(async ([sectionId, data]) => {
    const docRef = doc(db, 'guide_topics', topicId, 'content_sections', sectionId);
    await setDoc(docRef, {
      ...data,
      topicId,
      sectionType: sectionId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
  await Promise.all(promises);
};

export const updateTopicStatus = async (topicId: string, status: 'draft' | 'published') => {
  const docRef = doc(db, 'guide_topics', topicId);
  await setDoc(docRef, { status, updatedAt: serverTimestamp() }, { merge: true });
};

export const updateGuideNodeTitle = async (nodeId: string, nodeType: string, newTitle: string) => {
  const collectionName = nodeType === 'class' ? 'guide_classes' :
                         nodeType === 'subject' ? 'guide_subjects' :
                         nodeType === 'textbook' ? 'guide_textbooks' :
                         nodeType === 'chapter' ? 'guide_chapters' : 'guide_topics';
  await setDoc(doc(db, collectionName, nodeId), { title: newTitle, updatedAt: serverTimestamp() }, { merge: true });
};

export const createGuideClass = async (title: string) => {
  const docRef = await addDoc(collection(db, 'guide_classes'), {
    title,
    status: 'published',
    orderIndex: Date.now(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideSubject = async (classId: string, title: string) => {
  const docRef = await addDoc(collection(db, 'guide_subjects'), {
    classId,
    title,
    status: 'published',
    orderIndex: Date.now(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideTextbook = async (subjectId: string, title: string) => {
  const docRef = await addDoc(collection(db, 'guide_textbooks'), {
    subjectId,
    title,
    status: 'published',
    orderIndex: Date.now(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideChapter = async (textbookId: string, title: string) => {
  const docRef = await addDoc(collection(db, 'guide_chapters'), {
    textbookId,
    title,
    status: 'published',
    orderIndex: Date.now(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
};
