import { collection, query, orderBy, getDocs, doc, getDoc, where, setDoc, deleteDoc, getCountFromServer, serverTimestamp, addDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { SidebarSubject, Chapter, ReadingContentData } from "@/app/guide/guide-data"; // Types
import { getTaxonomyNodesByTrack } from "./taxonomy";
import hardcodedQuestionsRaw from '@/data/hardcoded/taxonomy/questions.json';

export const getGuideSubjects = async (): Promise<SidebarSubject[]> => {
  try {
    const allNodes = await getTaxonomyNodesByTrack('academic');
    const subjects = allNodes.filter(n => n.type === 'subject');
    return subjects.map(n => ({
      id: n.id,
      title: n.title,
      countStr: (n as any).countStr || '',
    })) as SidebarSubject[];
  } catch (error) {
    console.error("Error fetching guide subjects:", error);
    return [];
  }
};

const sortNodes = (nodes: any[]) => {
  const extractNumber = (title: string): number => {
    const match = title.match(/[0-9০-৯]+/);
    if (!match) return 0;
    const bengaliToEnglish: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    const numStr = match[0].replace(/[০-৯]/g, (c) => bengaliToEnglish[c]);
    return parseInt(numStr, 10);
  };

  return nodes.sort((a, b) => {
    const numA = extractNumber(a.title);
    const numB = extractNumber(b.title);
    
    if (numA !== numB && (numA > 0 || numB > 0)) {
      return numA - numB;
    }

    if (typeof a.orderIndex === 'number' && typeof b.orderIndex === 'number' && a.orderIndex !== b.orderIndex) {
      return a.orderIndex - b.orderIndex;
    }
    
    return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
  });
};

export const buildCurriculumFromTextbooks = async (textbooks: any[], allNodes: any[]): Promise<Chapter[]> => {
  const sortedTextbooks = sortNodes(textbooks);

  const result = await Promise.all(sortedTextbooks.map(async tb => {
    let chapters = allNodes.filter(n => n.parentId === tb.id && n.type === 'chapter');
    
    // Fallback to legacy collections if not migrated yet
    if (chapters.length === 0) {
      const q = query(collection(db, 'guide_chapters'), where('textbookId', '==', tb.id));
      const snap = await getDocs(q);
      chapters = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any, fullSlug: doc.data().slug || doc.id }));
    }
    
    const sortedChapters = sortNodes(chapters);

    const tbChapters = await Promise.all(sortedChapters.map(async ch => {
      let topics = allNodes.filter(n => n.parentId === ch.id && n.type === 'topic');
      
      // Fallback to legacy collections
      if (topics.length === 0) {
        const q2 = query(collection(db, 'guide_topics'), where('chapterId', '==', ch.id));
        const snap2 = await getDocs(q2);
        topics = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() as any, fullSlug: doc.data().slug || doc.id }));
      }

      const chTopics = sortNodes(topics).map(t => ({ 
        id: t.fullSlug || t.id, 
        dbId: t.id, 
        title: t.title, 
        type: 'topic' as const, 
        subtopics: [] 
      }));

      return {
        id: ch.fullSlug || ch.id,
        dbId: ch.id,
        title: ch.title,
        type: 'chapter' as const,
        subtopics: chTopics
      };
    }));

    return {
      id: tb.fullSlug || tb.id,
      dbId: tb.id,
      title: tb.title,
      topics: tbChapters
    };
  }));

  return result as unknown as Chapter[];
};

export const getCurriculumBySubject = async (subjectId: string): Promise<Chapter[]> => {
  try {
    const allNodes = await getTaxonomyNodesByTrack('academic');
    const textbooks = allNodes.filter(n => n.parentId === subjectId && n.type === 'textbook');
    return await buildCurriculumFromTextbooks(textbooks, allNodes);
  } catch (error) {
    console.error("Error fetching curriculum by subject:", error);
    return [];
  }
};

export const getCurriculumByClass = async (classId: string): Promise<Chapter[]> => {
  try {
    const allNodes = await getTaxonomyNodesByTrack('academic');
    const subjects = allNodes.filter(n => n.parentId === classId && n.type === 'subject');
    const subjectIds = subjects.map(s => s.id);
    const textbooks = allNodes.filter(n => (subjectIds.includes(n.parentId as string) || n.parentId === classId) && n.type === 'textbook');
    return await buildCurriculumFromTextbooks(textbooks, allNodes);
  } catch (error) {
    console.error("Error fetching curriculum by class:", error);
    return [];
  }
};

export const getCurriculumByBoard = async (boardId: string): Promise<Chapter[]> => {
  try {
    const allNodes = await getTaxonomyNodesByTrack('academic');
    
    const extractNumber = (title: string): number => {
      const match = title.match(/[0-9০-৯]+/);
      if (!match) return 0;
      const bengaliToEnglish: Record<string, string> = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
      };
      const englishNumStr = match[0].split('').map(char => bengaliToEnglish[char] || char).join('');
      return parseInt(englishNumStr, 10);
    };

    const sortNodes = (nodes: any[]) => {
      return nodes.sort((a, b) => {
        const numA = extractNumber(a.title || '');
        const numB = extractNumber(b.title || '');
        if (numA !== numB) return numA - numB;
        return (a.orderIndex || 0) - (b.orderIndex || 0);
      });
    };

    const classes = sortNodes(allNodes.filter(n => n.parentId === boardId && n.type === 'class'));
    
    return classes.map(c => {
      const subjects = sortNodes(allNodes.filter(n => n.parentId === c.id && n.type === 'subject'));
      return {
        id: c.fullSlug || c.id,
        title: c.title,
        type: 'chapter',
        topics: subjects.map(s => ({
          id: s.fullSlug || s.id,
          title: s.title,
          type: 'topic',
          subtopics: []
        }))
      };
    }) as unknown as Chapter[];
  } catch (error) {
    console.error("Error fetching curriculum by board:", error);
    return [];
  }
};

export const getReadingContent = async (contentId: string): Promise<ReadingContentData | null> => {
  try {
    const { getTaxonomyNodeById } = await import('./taxonomy');
    const taxNode = await getTaxonomyNodeById(contentId);
    
    let topicData: any = {};
    if (taxNode) {
      topicData = {
        title: taxNode.title,
        subtitle: taxNode.description || '',
        featureImage: taxNode.featureImage || '',
        author: {
          name: taxNode.contentAuthor?.name || taxNode.author || '',
          avatarUrl: taxNode.contentAuthor?.avatarUrl || ''
        },
        createdAt: taxNode.createdAt,
        updatedAt: taxNode.updatedAt,
        type: taxNode.type,
        content: (taxNode as any).content || ''
      };
    }

    let collectionPath = "guide_topics";
    if (taxNode && taxNode.type === 'chapter') {
      collectionPath = "guide_chapters";
    }

    // Fetch from guide_* to get legacy fields and check for content_sections existence
    const docSnap = await getDoc(doc(db, collectionPath, contentId));
    if (docSnap.exists()) {
      // Allow taxNode (which has the fresh title) to override old data
      topicData = { ...docSnap.data(), ...topicData };
    } else if (!taxNode) {
      // If no taxNode and no docSnap, fallback to guide_chapters
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
      'practice_sets',
      'notes',
      'solutions',
      'bookmark',
      'mcq',
      'quizzes',
      'creative_question',
      'short_question',
      'model_test',
      'mock_tests',
      'exams_papers',
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
      'objective': 'Lesson Objective',
      'introduction': 'Lesson Introduction',
      'author': 'Author Introduction',
      'explanation': 'Explanation',
      'exercise': 'Exercise',
      'practice_sets': 'Practice Sets',
      'notes': 'Notes',
      'solutions': 'Solutions',
      'bookmark': 'Bookmark',
      'mcq': 'MCQ',
      'quizzes': 'Quizzes',
      'creative_question': 'Creative Questions',
      'descriptive': 'Descriptive Questions',
      'model_test': 'Model Test',
      'mock_tests': 'Mock Tests',
      'exams_papers': 'Exams & Papers',
      'pdf': 'PDF Notes',
      'video': 'Video Lectures',
      'audio': 'Audio Lessons',
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
      
      // Filter out truly empty sections
      const isString = typeof data.content === 'string';
      const isEmptyString = isString && (!data.content.trim() || data.content.trim() === '<p></p>');
      const isNullOrUndefined = data.content === null || data.content === undefined;
      const isEmptyArray = Array.isArray(data.content) && data.content.length === 0;
      
      if (isEmptyString || isNullOrUndefined || isEmptyArray) {
        return; // Skip this section
      }
      
      let type = 'article';
      let sectionData: any = { body: data.content, body_en: data.content_en };
      
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

      // Try to extract author information from taxonomy node or section data
      const authorName = data.contentAuthor?.name || taxNode?.contentAuthor?.name || taxNode?.author || '';
      const authorAvatar = data.contentAuthor?.avatarUrl || taxNode?.contentAuthor?.avatarUrl || '';

      sections.push({
        id: d.id, // keep id for sorting
        title: SECTION_LABELS[sectionType] || sectionType,
        type,
        ...sectionData,
        author: {
          name: authorName,
          avatarUrl: authorAvatar
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
      const hasSections = sections && sections.length > 0;
      const hasContentBlocks = topicData.contentBlocks && topicData.contentBlocks.length > 0;
      const hasLegacyContent = topicData.content;
      
      let finalSections = hasSections ? sections : 
                            (hasContentBlocks || hasLegacyContent) ? undefined : 
                            [{ title: 'Overview', type: 'article', body: '<p>No content added yet.</p>', author: { name: 'System', avatarUrl: 'https://i.pravatar.cc/150' } }];

      // Inject hardcoded questions tabs
      if (Array.isArray(hardcodedQuestionsRaw)) {
        const topicQs = hardcodedQuestionsRaw.filter(q => q.topicId === contentId || q.chapterId === contentId);
        if (topicQs.length > 0) {
          if (!finalSections) {
            // Prepend a reading content section if we are upgrading undefined to an array
            finalSections = [{ id: 'guide_content', title: 'Lesson Content', type: 'article', body: topicData.content || '<p>No content added yet.</p>' }];
          }
          
          const hasMcq = topicQs.some(q => (q as any).type?.toLowerCase() === 'mcq' || (q as any).questionType?.toLowerCase() === 'mcq');
          if (hasMcq && !finalSections.some(s => s.id === 'mcq')) {
            finalSections.push({ id: 'mcq', title: 'MCQ', type: 'mcq' });
          }
          
          const hasCq = topicQs.some(q => {
            const t = ((q as any).type || (q as any).questionType || '').toLowerCase();
            return t === 'cq' || t === 'descriptive';
          });
          if (hasCq && !finalSections.some(s => s.id === 'creative_question')) {
            finalSections.push({ id: 'creative_question', title: 'Creative Questions', type: 'cq' });
          }
        }
      }

      // Sanitize topicData to remove Firestore Timestamp objects
      const safeTopicData = { ...topicData };
      if (safeTopicData.updatedAt?.toDate) safeTopicData.updatedAt = safeTopicData.updatedAt.toDate().toISOString();
      if (safeTopicData.createdAt?.toDate) safeTopicData.createdAt = safeTopicData.createdAt.toDate().toISOString();

      return {
        ...safeTopicData,
        id: contentId,
        title: topicData.title || contentId,
        subtitle: topicData.subtitle || 'Topic Content',
        ...(finalSections ? { sections: finalSections } : {})
      } as ReadingContentData;
    } else {
      // Fallback
      const docRef = doc(db, "guide_reading_content", contentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const safeData = docSnap.data();
        if (safeData.updatedAt?.toDate) safeData.updatedAt = safeData.updatedAt.toDate().toISOString();
        if (safeData.createdAt?.toDate) safeData.createdAt = safeData.createdAt.toDate().toISOString();
        return { id: docSnap.id, ...safeData } as ReadingContentData;
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
    const { getTaxonomyNodeById } = await import('./taxonomy');
    
    let currentNode = await getTaxonomyNodeById(nodeId);
    if (!currentNode) return null;

    let chapterId: string | null = null;
    let textbookId: string | null = null;
    let subjectId: string | null = null;
    let classId: string | null = null;
    let boardId: string | null = null;
    let topicId: string | null = null;
    
    let textbookTitle: string = 'Textbook';
    let subjectTitle: string = 'Subject';
    let chapterTitle: string = 'Chapter';
    let classTitle: string = 'Class';
    let boardTitle: string = 'Board';
    let topicTitle: string = 'Topic';

    // Walk up the hierarchy tree using parentId
    while (currentNode) {
      if (currentNode.type === 'board') {
        boardId = currentNode.id;
        boardTitle = currentNode.title;
      } else if (currentNode.type === 'class') {
        classId = currentNode.id;
        classTitle = currentNode.title;
      } else if (currentNode.type === 'subject') {
        subjectId = currentNode.id;
        subjectTitle = currentNode.title;
      } else if (currentNode.type === 'textbook') {
        textbookId = currentNode.id;
        textbookTitle = currentNode.title;
      } else if (currentNode.type === 'chapter') {
        chapterId = currentNode.id;
        chapterTitle = currentNode.title;
      } else if (currentNode.type === 'topic') {
        topicId = currentNode.id;
        topicTitle = currentNode.title;
      }
      
      if (!currentNode.parentId) break;
      currentNode = await getTaxonomyNodeById(currentNode.parentId);
    }

    return { boardId, boardTitle, classId, classTitle, subjectId, subjectTitle, textbookId, textbookTitle, chapterId, chapterTitle, topicId, topicTitle };
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

export const getTopicSections = async (nodeId: string) => {
  const nodeInfo = await findGuideNodeAnyLevel(nodeId);
  const collectionName = nodeInfo?.level === 'chapter' ? 'guide_chapters' : 'guide_topics';

  const q = query(collection(db, collectionName, nodeId, 'content_sections'));
  const snap = await getDocs(q);
  const sections: Record<string, any> = {};
  snap.forEach(doc => {
    sections[doc.id] = doc.data();
  });
  return sections;
};

export const saveTopicSections = async (nodeId: string, sections: Record<string, any>) => {
  const nodeInfo = await findGuideNodeAnyLevel(nodeId);
  const collectionName = nodeInfo?.level === 'chapter' ? 'guide_chapters' : 'guide_topics';

  const promises = Object.entries(sections).map(async ([sectionId, data]) => {
    const docRef = doc(db, collectionName, nodeId, 'content_sections', sectionId);
    await setDoc(docRef, {
      ...data,
      topicId: nodeId,
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
                topicId: nodeId,
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

export const updateTopicStatus = async (nodeId: string, status: 'draft' | 'published') => {
  const nodeInfo = await findGuideNodeAnyLevel(nodeId);
  const collectionName = nodeInfo?.level === 'chapter' ? 'guide_chapters' : 'guide_topics';

  const docRef = doc(db, collectionName, nodeId);
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

export const incrementGuideNodeViews = async (nodeId: string) => {
  try {
    const nodeInfo = await findGuideNodeAnyLevel(nodeId);
    if (!nodeInfo) return;
    
    const collectionName = nodeInfo.level === 'chapter' ? 'guide_chapters' : 'guide_topics';
    const docRef = doc(db, collectionName, nodeId);
    
    await setDoc(docRef, {
      views: increment(1)
    }, { merge: true });
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
};
export async function findGuideNodeAnyLevel(idOrSlug: string): Promise<{ node: any, level: string } | null> {
  const { getTaxonomyNodeById } = await import('./taxonomy');
  
  // Try ID first
  let node: any = await getTaxonomyNodeById(idOrSlug);
  
  if (!node) {
    // Try slug
    const q = query(collection(db, 'taxonomy_nodes'), where('slug', '==', idOrSlug));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const d = querySnap.docs[0];
      node = { id: d.id, ...d.data() };
    }
  }

  if (node) {
    return { node, level: node.type };
  }

  return null;
}

// Function to generate the correct frontend URL for a guide node
export function getGuideNodeUrl(node: any): string {
  if (!node) return '/guide';
  const idToUse = node.slug || node.id;
  // Based on user request, all levels should be accessible under /guide/[id]
  return `/guide/${idToUse}`;
}

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

