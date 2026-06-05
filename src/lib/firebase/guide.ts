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
    // 1. Fetch Chapters for this subject
    const chaptersQuery = query(
      collection(db, "guide_chapters"), 
      where("subjectId", "==", subjectId),
      orderBy("orderIndex", "asc")
    );
    const chaptersSnap = await getDocs(chaptersQuery);
    
    if (chaptersSnap.empty) return [];

    // 2. Fetch Topics for these chapters
    // For simplicity, we fetch all topics for this subject (we can filter by subjectId if we add it to topics, 
    // or fetch by chunks of chapterIds if > 10). Let's fetch all guide_topics and filter in memory if small,
    // or add subjectId to topics. Let's assume topics have subjectId.
    const topicsQuery = query(
      collection(db, "guide_topics"),
      where("subjectId", "==", subjectId),
      orderBy("orderIndex", "asc")
    );
    const topicsSnap = await getDocs(topicsQuery);

    const topicsByChapterId: Record<string, any[]> = {};
    topicsSnap.forEach(doc => {
      const data = doc.data();
      if (!topicsByChapterId[data.chapterId]) {
        topicsByChapterId[data.chapterId] = [];
      }
      topicsByChapterId[data.chapterId].push({
        id: doc.id,
        title: data.title,
        type: 'topic',
        subtopics: data.subtopics || [],
      });
    });

    const curriculum: Chapter[] = chaptersSnap.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      topics: topicsByChapterId[doc.id] || []
    }));

    return curriculum;
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return [];
  }
};

export const getReadingContent = async (contentId: string): Promise<ReadingContentData | null> => {
  try {
    const topicDoc = await getDoc(doc(db, "guide_topics", contentId));
    let topicData = topicDoc.exists() ? topicDoc.data() : null;

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
  const q = query(collection(db, 'guide_classes'), orderBy('orderIndex', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getGuideSubjectsByClass = async (classId: string) => {
  const q = query(collection(db, 'guide_subjects'), where('classId', '==', classId), orderBy('orderIndex', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getGuideTextbooksBySubject = async (subjectId: string) => {
  const q = query(collection(db, 'guide_textbooks'), where('subjectId', '==', subjectId), orderBy('orderIndex', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getGuideChaptersByTextbook = async (textbookId: string) => {
  const q = query(collection(db, 'guide_chapters'), where('textbookId', '==', textbookId), orderBy('orderIndex', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getGuideTopicsByChapter = async (chapterId: string) => {
  const q = query(collection(db, 'guide_topics'), where('chapterId', '==', chapterId), orderBy('orderIndex', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

export const createGuideClass = async (title: string) => {
  const docRef = await addDoc(collection(db, 'guide_classes'), {
    title,
    status: 'published',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideSubject = async (classId: string, title: string) => {
  const docRef = await addDoc(collection(db, 'guide_subjects'), {
    classId,
    title,
    status: 'published',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideTextbook = async (subjectId: string, title: string) => {
  const docRef = await addDoc(collection(db, 'guide_textbooks'), {
    subjectId,
    title,
    status: 'published',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideChapter = async (textbookId: string, title: string) => {
  const docRef = await addDoc(collection(db, 'guide_chapters'), {
    textbookId,
    title,
    status: 'published',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};
