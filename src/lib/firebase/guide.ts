import { collection, query, orderBy, getDocs, doc, getDoc, where, setDoc, deleteDoc, getCountFromServer, serverTimestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { SidebarSubject, Chapter, ReadingContentData } from "@/app/guide/guide-data"; // Types

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
    let collectionPath = "guide_topics";
    let topicDoc = await getDoc(doc(db, "guide_topics", contentId));
    let topicData = topicDoc.exists() ? topicDoc.data() : null;

    if (!topicData || !topicData.title) {
      const chapterDoc = await getDoc(doc(db, "guide_chapters", contentId));
      if (chapterDoc.exists()) {
        topicData = { ...topicData, ...chapterDoc.data() };
        collectionPath = "guide_chapters";
      }
    }

    const SECTION_ORDER = [
      'lesson',
      'guide_content',
      'word_meaning',
      'objective',
      'introduction',
      'author',
      'explanation',
      'exercise',
      'mcq',
      'creative_question',
      'short_question',
      'model_test',
      'pdf',
      'video',
      'audio',
      'q_a',
      'cq',
      'board_question',
      'video_classes'
    ];

    const SECTION_LABELS: Record<string, string> = {
      'lesson': 'Read Lesson',
      'guide_content': 'Guide Content',
      'word_meaning': 'Word Meaning',
      'objective': 'Objective',
      'introduction': 'Introduction',
      'author': 'Author',
      'explanation': 'Explanation',
      'exercise': 'Exercise',
      'mcq': 'MCQ',
      'creative_question': 'Creative Question',
      'short_question': 'Short Question',
      'model_test': 'Model Test',
      'pdf': 'PDF',
      'video': 'Video',
      'audio': 'Audio',
      'q_a': 'Q/A',
      'cq': 'CQ',
      'board_question': 'Board Question',
      'video_classes': 'Video Classes'
    };

    const q = query(collection(db, collectionPath, contentId, "content_sections"));
    const snap = await getDocs(q);
    const sections: any[] = [];
    snap.forEach(d => {
      const sectionType = d.data().sectionType || d.id;
      const data = d.data();
      
      let type = 'article';
      let sectionData: any = { body: data.content };
      
      if (sectionType === 'mcq') {
        type = 'mcq';
        try {
          sectionData = { questions: typeof data.content === 'string' ? JSON.parse(data.content) : data.content };
        } catch (e) {
          sectionData = { questions: [] };
        }
      } else if (sectionType === 'pdf') {
        type = 'pdf';
        try {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          sectionData = { pdfData: Array.isArray(parsed) ? parsed : [parsed].filter(p => p && (p.url || p.title)) };
        } catch (e) {
          sectionData = { pdfData: [] };
        }
      } else if (sectionType === 'video') {
        type = 'video';
        try {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          sectionData = { videoData: Array.isArray(parsed) ? parsed : [parsed].filter(p => p && (p.url || p.title)) };
        } catch (e) {
          sectionData = { videoData: [] };
        }
      } else if (sectionType === 'audio') {
        type = 'audio';
        try {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          sectionData = { audioData: Array.isArray(parsed) ? parsed : [parsed].filter(p => p && (p.url || p.title)) };
        } catch (e) {
          sectionData = { audioData: [] };
        }
      }

      sections.push({
        id: d.id, // keep id for sorting
        title: SECTION_LABELS[sectionType] || sectionType,
        type,
        ...sectionData,
        author: {
          name: 'Sattar Uddin Sohel',
          avatarUrl: 'https://i.pravatar.cc/150?u=sattar'
        }
      });
    });

    // Fetch globally attached videos for this topic
    try {
      const vQuery = query(collection(db, "guide_videos"), where('topicIds', 'array-contains', contentId));
      const vSnap = await getDocs(vQuery);
      if (!vSnap.empty) {
        const videoData = vSnap.docs.map(d => {
          const v = d.data();
          return { url: v.videoUrl || v.url, title: v.title };
        });
        
        // Check if there's already a video section (from legacy JSON)
        const existingVideoSec = sections.find(s => s.id === 'video');
        if (existingVideoSec) {
           existingVideoSec.videoData = [...(existingVideoSec.videoData || []), ...videoData];
        } else {
           sections.push({
             id: 'video',
             title: 'Video',
             type: 'video',
             videoData: videoData
           });
        }
      }
    } catch (e) {
      console.error('Error fetching global videos', e);
    }

    sections.sort((a, b) => {
      const aIndex = SECTION_ORDER.indexOf(a.id);
      const bIndex = SECTION_ORDER.indexOf(b.id);
      const aPos = aIndex === -1 ? 999 : aIndex;
      const bPos = bIndex === -1 ? 999 : bIndex;
      return aPos - bPos;
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

export const getTopicHierarchy = async (nodeId: string) => {
  try {
    let chapterId: string | null = null;
    let textbookId: string | null = null;
    let subjectId: string | null = null;
    let classId: string | null = null;
    let boardId: string | null = null;
    
    let textbookTitle: string = 'Textbook';
    let subjectTitle: string = 'Subject';
    let chapterTitle: string = 'Chapter';
    let classTitle: string = 'Class';
    let boardTitle: string = 'Board';

    const topicDoc = await getDoc(doc(db, "guide_topics", nodeId));
    if (topicDoc.exists() && topicDoc.data().chapterId) {
      chapterId = topicDoc.data().chapterId;
    } else {
      const chapterDoc = await getDoc(doc(db, "guide_chapters", nodeId));
      if (chapterDoc.exists()) {
        chapterId = nodeId;
      } else {
        const textbookDoc = await getDoc(doc(db, "guide_textbooks", nodeId));
        if (textbookDoc.exists()) {
          textbookId = nodeId;
        } else {
          const subjectDoc = await getDoc(doc(db, "guide_subjects", nodeId));
          if (subjectDoc.exists()) {
            subjectId = nodeId;
          } else {
            const classDoc = await getDoc(doc(db, "guide_classes", nodeId));
            if (classDoc.exists()) {
              classId = nodeId;
            }
          }
        }
      }
    }

    if (chapterId) {
      const chapterDoc = await getDoc(doc(db, "guide_chapters", chapterId));
      if (chapterDoc.exists()) {
        chapterTitle = chapterDoc.data().title;
        if (chapterDoc.data().textbookId) textbookId = chapterDoc.data().textbookId as string;
      }
    }

    if (textbookId) {
      const textbookDoc = await getDoc(doc(db, "guide_textbooks", textbookId));
      if (textbookDoc.exists()) {
        textbookTitle = textbookDoc.data().title;
        if (textbookDoc.data().subjectId) subjectId = textbookDoc.data().subjectId as string;
      }
    }

    if (subjectId) {
      const subjectDoc = await getDoc(doc(db, "guide_subjects", subjectId));
      if (subjectDoc.exists()) {
        subjectTitle = subjectDoc.data().title;
        if (subjectDoc.data().classId) classId = subjectDoc.data().classId as string;
      }
    }

    if (classId) {
      const classDoc = await getDoc(doc(db, "guide_classes", classId));
      if (classDoc.exists()) {
        classTitle = classDoc.data().title;
        if (classDoc.data().boardId) boardId = classDoc.data().boardId as string;
      }
    }

    if (boardId) {
      const boardDoc = await getDoc(doc(db, "guide_boards", boardId));
      if (boardDoc.exists()) {
        boardTitle = boardDoc.data().title;
      }
    }

    return { boardId, boardTitle, classId, classTitle, subjectId, subjectTitle, textbookId, textbookTitle, chapterId, chapterTitle };
  } catch (error) {
    console.error("Error finding topic hierarchy:", error);
    return null;
  }
};

export const getSubjectIdFromTopicId = async (topicId: string): Promise<string | null> => {
  const hierarchy = await getTopicHierarchy(topicId);
  return hierarchy ? hierarchy.subjectId : null;
};

export const saveGuideSubject = async (id: string, data: any) => {
  await setDoc(doc(db, "guide_subjects", id), data);
};

export const saveGuideChapter = async (id: string, data: any) => {
  await setDoc(doc(db, "guide_chapters", id), data);
};

export const saveGuideTopic = async (id: string, data: any) => {
  await setDoc(doc(db, "guide_topics", id), data);
};

export const saveGuideReadingContent = async (id: string, data: any) => {
  await setDoc(doc(db, "guide_reading_content", id), data);
};

export const deleteGuideReadingContent = async (id: string) => {
  await deleteDoc(doc(db, "guide_reading_content", id));
};

export const deleteGuideTopic = async (id: string) => {
  const snap = await getDocs(collection(db, 'guide_topics', id, 'content_sections'));
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  await deleteDoc(doc(db, "guide_topics", id));
};

export const deleteGuideChapter = async (id: string) => {
  const snap = await getDocs(collection(db, 'guide_chapters', id, 'content_sections'));
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  const topics = await getGuideTopicsByChapter(id);
  for (const t of topics) await deleteGuideTopic(t.id);
  await deleteDoc(doc(db, "guide_chapters", id));
};

export const deleteGuideSubject = async (id: string) => {
  const textbooks = await getGuideTextbooksBySubject(id);
  for (const t of textbooks) await deleteGuideTextbook(t.id);
  await deleteDoc(doc(db, "guide_subjects", id));
};

export const deleteGuideTextbook = async (id: string) => {
  const chapters = await getGuideChaptersByTextbook(id);
  for (const c of chapters) await deleteGuideChapter(c.id);
  await deleteDoc(doc(db, "guide_textbooks", id));
};

export const deleteGuideClass = async (id: string) => {
  const subjects = await getGuideSubjectsByClass(id);
  for (const s of subjects) await deleteGuideSubject(s.id);
  await deleteDoc(doc(db, "guide_classes", id));
};

export const deleteGuideBoard = async (id: string) => {
  const classes = await getGuideClassesByBoard(id);
  for (const c of classes) await deleteGuideClass(c.id);
  await deleteDoc(doc(db, "guide_boards", id));
};

export const moveGuideNode = async (
  nodeId: string,
  nodeType: 'chapter' | 'topic',
  newParentId: string,
  newParentType: 'textbook' | 'chapter'
) => {
  // Scenario 1: Topic to another Chapter
  if (nodeType === 'topic' && newParentType === 'chapter') {
    await setDoc(doc(db, 'guide_topics', nodeId), { chapterId: newParentId, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true, message: 'Topic moved successfully' };
  }

  // Helper to copy content sections
  const copyContentSections = async (oldCollection: string, newCollection: string, newDocId: string) => {
    const snap = await getDocs(collection(db, oldCollection, nodeId, 'content_sections'));
    const promises = snap.docs.map(d => {
      const data = d.data();
      return setDoc(doc(db, newCollection, newDocId, 'content_sections', d.id), data);
    });
    await Promise.all(promises);
  };

  // Scenario 2: Chapter to Topic (under another Chapter)
  if (nodeType === 'chapter' && newParentType === 'chapter') {
    const topics = await getGuideTopicsByChapter(nodeId);
    if (topics.length > 0) {
      return { success: false, message: 'Cannot convert a Chapter with existing Topics. Delete or move the Topics first.' };
    }

    const chapterSnap = await getDoc(doc(db, 'guide_chapters', nodeId));
    if (!chapterSnap.exists()) return { success: false, message: 'Chapter not found' };
    const data = chapterSnap.data();

    // Create new Topic
    const newTopicId = await createGuideTopic(newParentId, data.title, data.author);
    
    // Copy SEO data if exists
    await setDoc(doc(db, 'guide_topics', newTopicId), {
      slug: data.slug || '',
      seoTitle: data.seoTitle || '',
      description: data.description || '',
      featureImage: data.featureImage || '',
      tags: data.tags || [],
      keywords: data.keywords || [],
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Copy sections
    await copyContentSections('guide_chapters', 'guide_topics', newTopicId);

    // Delete old Chapter
    await deleteGuideChapter(nodeId);

    return { success: true, message: 'Chapter converted to Topic successfully' };
  }

  // Scenario 3: Topic to Chapter (under a Textbook)
  if (nodeType === 'topic' && newParentType === 'textbook') {
    const topicSnap = await getDoc(doc(db, 'guide_topics', nodeId));
    if (!topicSnap.exists()) return { success: false, message: 'Topic not found' };
    const data = topicSnap.data();

    // Create new Chapter
    const newChapterId = await createGuideChapter(newParentId, data.title, data.author);

    // Copy SEO data if exists
    await setDoc(doc(db, 'guide_chapters', newChapterId), {
      slug: data.slug || '',
      seoTitle: data.seoTitle || '',
      description: data.description || '',
      featureImage: data.featureImage || '',
      tags: data.tags || [],
      keywords: data.keywords || [],
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Copy sections
    await copyContentSections('guide_topics', 'guide_chapters', newChapterId);

    // Delete old Topic
    await deleteGuideTopic(nodeId);

    return { success: true, message: 'Topic converted to Chapter successfully' };
  }

  return { success: false, message: 'Invalid move operation' };
};

// --- NEW HIERARCHY FETCHERS ---

export const getGuideStats = async () => {
  try {
    const [boards, classes, subjects, textbooks, chapters, topics] = await Promise.all([
      getCountFromServer(collection(db, 'guide_boards')),
      getCountFromServer(collection(db, 'guide_classes')),
      getCountFromServer(collection(db, 'guide_subjects')),
      getCountFromServer(collection(db, 'guide_textbooks')),
      getCountFromServer(collection(db, 'guide_chapters')),
      getCountFromServer(collection(db, 'guide_topics'))
    ]);
    return {
      boards: boards.data().count,
      classes: classes.data().count,
      subjects: subjects.data().count,
      textbooks: textbooks.data().count,
      chapters: chapters.data().count,
      topics: topics.data().count,
    };
  } catch (error) {
    console.error('Error fetching guide stats:', error);
    return { boards: 0, classes: 0, subjects: 0, textbooks: 0, chapters: 0, topics: 0 };
  }
};

export const getGuideBoards = async () => {
  const q = query(collection(db, 'guide_boards'));
  const snap = await getDocs(q);
  const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  return docs.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getGuideClasses = async () => {
  const q = query(collection(db, 'guide_classes'));
  const snap = await getDocs(q);
  const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  return docs.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getGuideClassesByBoard = async (boardId: string) => {
  const q = query(collection(db, 'guide_classes'), where('boardId', '==', boardId));
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

export const getGuideTextbooks = async () => {
  const q = query(collection(db, 'guide_textbooks'));
  const snap = await getDocs(q);
  const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  return docs.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getGuideAllChapters = async () => {
  const q = query(collection(db, 'guide_chapters'));
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

    if (sectionId === 'pdf' || sectionId === 'video' || sectionId === 'audio') {
      try {
        const items = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
        if (Array.isArray(items)) {
          const collectionName = sectionId === 'pdf' ? 'guide_documents' : sectionId === 'video' ? 'guide_videos' : 'guide_audios';
          const itemPromises = items.map(async (item: any) => {
            if (item.url && item.id) {
              const itemRef = doc(db, collectionName, item.id);
              await setDoc(itemRef, {
                title: item.title || `Untitled ${sectionId}`,
                url: item.url,
                description: item.description || '',
                tags: item.tags || '',
                topicId,
                type: sectionId,
                updatedAt: serverTimestamp(),
                createdAt: item.createdAt || serverTimestamp()
              }, { merge: true });
            }
          });
          await Promise.all(itemPromises);
        }
      } catch (e) {
        console.error("Failed to sync standalone items:", e);
      }
    }
  });
  await Promise.all(promises);
};

export const updateTopicStatus = async (topicId: string, status: 'draft' | 'published') => {
  const docRef = doc(db, 'guide_topics', topicId);
  await setDoc(docRef, { status, updatedAt: serverTimestamp() }, { merge: true });
};

export const updateGuideNodeTitle = async (nodeId: string, nodeType: string, newTitle: string, author?: string) => {
  const collectionName = nodeType === 'board' ? 'guide_boards' :
                         nodeType === 'class' ? 'guide_classes' :
                         nodeType === 'subject' ? 'guide_subjects' :
                         nodeType === 'textbook' ? 'guide_textbooks' :
                         nodeType === 'chapter' ? 'guide_chapters' : 'guide_topics';
  const updateData: any = { title: newTitle, updatedAt: serverTimestamp() };
  if (author !== undefined) {
    updateData.author = author;
  }
  await setDoc(doc(db, collectionName, nodeId), updateData, { merge: true });
};

export const createGuideBoard = async (title: string) => {
  const docRef = doc(collection(db, 'guide_boards'));
  await setDoc(docRef, {
    title,
    status: 'published',
    orderIndex: Date.now(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideClass = async (boardId: string, title: string) => {
  const docRef = doc(collection(db, 'guide_classes'));
  await setDoc(docRef, {
    boardId,
    title,
    status: 'published',
    orderIndex: Date.now(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideSubject = async (classId: string, title: string) => {
  const docRef = doc(collection(db, 'guide_subjects'));
  await setDoc(docRef, {
    classId,
    title,
    status: 'published',
    orderIndex: Date.now(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideTextbook = async (subjectId: string, title: string, author?: string) => {
  const docRef = doc(collection(db, 'guide_textbooks'));
  await setDoc(docRef, {
    subjectId,
    title,
    ...(author ? { author } : {}),
    status: 'published',
    orderIndex: Date.now(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideChapter = async (textbookId: string, title: string, author?: string) => {
  const docRef = doc(collection(db, 'guide_chapters'));
  await setDoc(docRef, {
    textbookId,
    title,
    ...(author ? { author } : {}),
    status: 'published',
    orderIndex: Date.now(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const createGuideTopic = async (chapterId: string, title: string, author?: string) => {
  const docRef = doc(collection(db, 'guide_topics'));
  await setDoc(docRef, {
    chapterId,
    title,
    ...(author ? { author } : {}),
    status: 'published',
    orderIndex: Date.now(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const fetchGuideItems = async (collectionName: string): Promise<any[]> => {
  const q = query(collection(db, collectionName), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getMediaItemBySlug = async (collectionName: string, slug: string): Promise<any> => {
  const q = query(collection(db, collectionName), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  // Fallback to searching by ID if slug not found
  return await getMediaItemById(collectionName, slug);
};

export const getMediaItemById = async (collectionName: string, id: string): Promise<any> => {
  const docRef = doc(db, collectionName, id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

export const updateMediaItemExtraData = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, data, { merge: true });
};

export const getTopicById = async (id: string): Promise<any> => {
  const docRef = doc(db, 'guide_topics', id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

export const getTopicFullHierarchy = async (topicId: string) => {
  let hierarchy: any = { topic: null, chapter: null, textbook: null, subject: null, class: null, board: null };

  const topicSnap = await getDoc(doc(db, 'guide_topics', topicId));
  if (!topicSnap.exists()) return hierarchy;
  hierarchy.topic = { id: topicSnap.id, ...topicSnap.data() };

  if (hierarchy.topic.chapterId) {
    const chapterSnap = await getDoc(doc(db, 'guide_chapters', hierarchy.topic.chapterId));
    if (chapterSnap.exists()) {
      hierarchy.chapter = { id: chapterSnap.id, ...chapterSnap.data() };
      
      if (hierarchy.chapter.textbookId) {
        const textbookSnap = await getDoc(doc(db, 'guide_textbooks', hierarchy.chapter.textbookId));
        if (textbookSnap.exists()) {
          hierarchy.textbook = { id: textbookSnap.id, ...textbookSnap.data() };

          if (hierarchy.textbook.subjectId) {
            const subjectSnap = await getDoc(doc(db, 'guide_subjects', hierarchy.textbook.subjectId));
            if (subjectSnap.exists()) {
              hierarchy.subject = { id: subjectSnap.id, ...subjectSnap.data() };

              if (hierarchy.subject.classId) {
                const classSnap = await getDoc(doc(db, 'guide_classes', hierarchy.subject.classId));
                if (classSnap.exists()) {
                  hierarchy.class = { id: classSnap.id, ...classSnap.data() };

                  if (hierarchy.class.boardId) {
                    const boardSnap = await getDoc(doc(db, 'guide_boards', hierarchy.class.boardId));
                    if (boardSnap.exists()) {
                      hierarchy.board = { id: boardSnap.id, ...boardSnap.data() };
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

  return hierarchy;
};

export const migrateOldTextbooksToGuide = async (onProgress?: (msg: string) => void, filterBoard?: string, filterClass?: string, selectedTextbookId?: string) => {
  try {
    let oldTextbooks: any[] = [];
    if (selectedTextbookId && selectedTextbookId !== 'all') {
      onProgress?.('Fetching selected textbook...');
      const docSnap = await getDoc(doc(db, 'textbooks', selectedTextbookId));
      if (docSnap.exists()) {
        oldTextbooks.push({ id: docSnap.id, ...docSnap.data() as any });
      }
    } else {
      onProgress?.('Fetching old textbooks...');
      const oldTextbooksSnap = await getDocs(collection(db, 'textbooks'));
      oldTextbooks = oldTextbooksSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

      if (filterBoard && filterBoard !== 'all') {
        oldTextbooks = oldTextbooks.filter(t => (t.board || 'Default Board') === filterBoard);
      }
      if (filterClass && filterClass !== 'all') {
        oldTextbooks = oldTextbooks.filter(t => (t.class || 'Default Class') === filterClass);
      }
    }

    let boardCache: Record<string, string> = {};
    let classCache: Record<string, string> = {};
    let subjectCache: Record<string, string> = {};
    let tbCache: Record<string, string> = {};
    let chapterCache: Record<string, string> = {};
    let topicCache: Record<string, string> = {};

    onProgress?.('Pre-loading existing taxonomy to prevent network timeouts...');
    const boardsSnap = await getDocs(collection(db, 'guide_boards'));
    boardsSnap.docs.forEach(d => boardCache[d.data().title || d.data().name] = d.id);

    const classesSnap = await getDocs(collection(db, 'guide_classes'));
    classesSnap.docs.forEach(d => classCache[d.data().boardId + '_' + d.data().title] = d.id);

    const subjectsSnap = await getDocs(collection(db, 'guide_subjects'));
    subjectsSnap.docs.forEach(d => subjectCache[d.data().classId + '_' + d.data().title] = d.id);

    const tbsSnap = await getDocs(collection(db, 'guide_textbooks'));
    tbsSnap.docs.forEach(d => tbCache[d.data().subjectId + '_' + d.data().title] = d.id);

    const chapsSnap = await getDocs(collection(db, 'guide_chapters'));
    chapsSnap.docs.forEach(d => chapterCache[d.data().textbookId + '_' + d.data().title] = d.id);

    const topicsSnap2 = await getDocs(collection(db, 'guide_topics'));
    topicsSnap2.docs.forEach(d => topicCache[d.data().chapterId + '_' + d.data().title] = d.id);

    let count = 0;
    for (const textbook of oldTextbooks) {
      count++;
      onProgress?.(`Migrating textbook ${count} of ${oldTextbooks.length}: ${textbook.title}`);

      const boardTitle = textbook.board || 'Default Board';
      let boardId = boardCache[boardTitle];
      if (!boardId) {
        boardId = await createGuideBoard(boardTitle);
        boardCache[boardTitle] = boardId;
      }

      const classTitle = textbook.class || 'Default Class';
      const classKey = boardId + '_' + classTitle;
      let classId = classCache[classKey];
      if (!classId) {
        classId = await createGuideClass(boardId, classTitle);
        classCache[classKey] = classId;
      }

      const subjectTitle = textbook.subject || 'Default Subject';
      const subjectKey = classId + '_' + subjectTitle;
      let subjectId = subjectCache[subjectKey];
      if (!subjectId) {
        subjectId = await createGuideSubject(classId, subjectTitle);
        subjectCache[subjectKey] = subjectId;
      }

      const tbKey = subjectId + '_' + textbook.title;
      let textbookId = tbCache[tbKey];
      if (textbookId) {
        await setDoc(doc(db, 'guide_textbooks', textbookId), { author: textbook.author || '', updatedAt: serverTimestamp() }, { merge: true });
      } else {
        textbookId = await createGuideTextbook(subjectId, textbook.title, textbook.author || '');
        tbCache[tbKey] = textbookId;
      }

      const chaptersSnap = await getDocs(collection(db, `textbooks/${textbook.id}/chapters`));
      for (const chapterDoc of chaptersSnap.docs) {
        const chapterData = chapterDoc.data();
        const chapKey = textbookId + '_' + chapterData.title;
        let chapterId = chapterCache[chapKey];
        if (chapterId) {
          await setDoc(doc(db, 'guide_chapters', chapterId), { author: chapterData.author || '', updatedAt: serverTimestamp() }, { merge: true });
        } else {
          chapterId = await createGuideChapter(textbookId, chapterData.title, chapterData.author || '');
          chapterCache[chapKey] = chapterId;
        }

        if (chapterData.content) {
          await setDoc(doc(db, 'guide_chapters', chapterId, 'content_sections', 'lesson'), {
            sectionType: 'lesson',
            content: chapterData.content,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }

        const topicsSnap = await getDocs(collection(db, `textbooks/${textbook.id}/chapters/${chapterDoc.id}/topics`));
        const topicPromises = topicsSnap.docs.map(async (topicDoc) => {
          const topicData = topicDoc.data();
          const topicKey = chapterId + '_' + topicData.title;
          let newTopicId = topicCache[topicKey];
          if (newTopicId) {
            await setDoc(doc(db, 'guide_topics', newTopicId), { author: topicData.author || '', updatedAt: serverTimestamp() }, { merge: true });
          } else {
            newTopicId = await createGuideTopic(chapterId, topicData.title, topicData.author || '');
            topicCache[topicKey] = newTopicId;
          }

          if (topicData.content) {
            await setDoc(doc(db, 'guide_topics', newTopicId, 'content_sections', 'lesson'), {
              sectionType: 'lesson',
              content: topicData.content,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        });
        
        await Promise.all(topicPromises);
        
        // Add a tiny delay after each chapter to let the Firebase WebSocket queue flush
        await new Promise(r => setTimeout(r, 100));
      }
    }
    onProgress?.('Migration complete!');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    onProgress?.('Error during migration. Check console.');
    return false;
  }
};


export const updateGuideNodeOrders = async (nodeType: string, updates: { id: string, orderIndex: number }[]) => {
  const collectionMap: Record<string, string> = {
    'board': 'guide_boards',
    'class': 'guide_classes',
    'subject': 'guide_subjects',
    'textbook': 'guide_textbooks',
    'chapter': 'guide_chapters',
    'topic': 'guide_topics'
  };
  const coll = collectionMap[nodeType];
  if (!coll) return;
  
  const promises = updates.map(update => 
    setDoc(doc(db, coll, update.id), { orderIndex: update.orderIndex }, { merge: true })
  );
  await Promise.all(promises);
};

export const updateGuideNodeSEO = async (nodeType: string, id: string, seoData: any) => {
  const collectionMap: Record<string, string> = {
    'board': 'guide_boards',
    'class': 'guide_classes',
    'subject': 'guide_subjects',
    'textbook': 'guide_textbooks',
    'chapter': 'guide_chapters',
    'topic': 'guide_topics'
  };
  const coll = collectionMap[nodeType];
  if (!coll) return false;

  try {
    // Generate a default slug if empty and title exists
    if (!seoData.slug && seoData.title) {
      seoData.slug = seoData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    await setDoc(doc(db, coll, id), { 
      slug: seoData.slug || '',
      seoTitle: seoData.seoTitle || '',
      description: seoData.description || '',
      featureImage: seoData.featureImage || '',
      tags: seoData.tags || [],
      keywords: seoData.keywords || [],
      updatedAt: serverTimestamp() 
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating SEO data:', error);
    return false;
  }
};


export const getGuideNodeById = async (id: string) => {
  const collections = ['guide_boards', 'guide_classes', 'guide_subjects', 'guide_textbooks', 'guide_chapters', 'guide_topics'];
  for (const coll of collections) {
    const docSnap = await getDoc(doc(db, coll, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, type: coll.replace('guide_', '').replace(/s$/, ''), ...docSnap.data() };
    }
  }
  return null;
};

export const getGuideNodeBySlugOrId = async (collectionName: string, slugOrId: string) => {
  // Try ID first
  const docSnap = await getDoc(doc(db, collectionName, slugOrId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  
  // Try slug
  const q = query(collection(db, collectionName), where('slug', '==', slugOrId));
  const querySnap = await getDocs(q);
  if (!querySnap.empty) {
    const d = querySnap.docs[0];
    return { id: d.id, ...d.data() };
  }
  
  return null;
};

