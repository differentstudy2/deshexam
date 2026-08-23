import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc, serverTimestamp, updateDoc, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import * as hardcodedRegistry from "@/data/hardcoded/taxonomy";

export type TaxonomyTrack = 'academic' | 'competitive';
export type AcademicNodeType = 'board' | 'institution' | 'class' | 'subject' | 'textbook' | 'chapter' | 'topic' | 'section';
export type CompetitiveNodeType = 'category' | 'subcategory' | 'exam' | 'subject' | 'chapter' | 'topic';
export type NodeType = AcademicNodeType | CompetitiveNodeType;

export const VALID_CONTENT_TYPES = ['mcq', 'cq', 'questions', 'notes', 'summary', 'practice', 'practice-set', 'practice-sets', 'mock-test', 'mock-tests', 'model-test', 'quiz', 'quizzes', 'exam-papers', 'video', 'pdf', 'lesson', 'guide-content', 'word-meaning', 'objective', 'introduction', 'author', 'explanation', 'exercise', 'creative-question', 'descriptive', 'q-a', 'board-question', 'video-classes', 'solutions'] as const;
export type ContentType = typeof VALID_CONTENT_TYPES[number] | string;

export interface TaxonomyNode {
  id: string;
  title: string;
  slug?: string;
  type: NodeType;
  track: TaxonomyTrack;
  parentId: string | null;
  rootId?: string | null; // Optional: helps to quickly find all items under a main board/category
  grandParentId?: string | null; // Optional: helps to find items using grandparent ID
  orderIndex: number;
  status: 'active' | 'inactive' | 'published' | 'draft';
  
  // SEO & Routing Fields
  fullSlug?: string;
  boardSlug?: string | null;
  classSlug?: string | null;
  subjectSlug?: string | null;
  bookSlug?: string | null;
  chapterSlug?: string | null;
  topicSlug?: string | null;
  
  // Rich Breadcrumbs support
  ancestors?: { id: string, slug: string, title: string, type: string }[];
  
  // Indexing & Schema
  isIndexable?: boolean;
  schemaType?: string;
  seo?: {
    customTitle?: string;
    customDescription?: string;
    focusKeyword?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    robotsIndex?: boolean;
    useCustomSeo?: boolean;
  };
  // Optional fields used by specific node types
  icon?: string;
  description?: string;
  author?: string;
  contentAuthor?: {
    name: string;
    avatarUrl: string;
    id?: string;
  };
  
  // Subject specific field
  subjectCode?: string;
  // Board / Institution specific optional fields
  acronym?: string;
  boardType?: 'Central Board' | 'State Board' | 'Public School' | 'Private School' | 'College' | 'University' | 'Coaching Institute' | 'Other';
  stateRegion?: string;
  logoUrl?: string;
  websiteUrl?: string;
  establishedYear?: string;
  headquarters?: string;
  
  // Physical Institution / Google Maps specific fields
  placeId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  userRatingsTotal?: number;
  phoneNumber?: string;
  internationalPhoneNumber?: string;
  openingHours?: string[];
  galleryImages?: string[];
  reviews?: {
    id?: string;
    authorName: string;
    rating: number;
    text: string;
    time: string;
    authorPhotoUrl: string;
    isVerified?: boolean;
    likedBy?: string[];
    dislikedBy?: string[];
  }[];
  totalEnrollment?: number;
  mediumOfInstruction?: string[];
  aiReviewSummary?: string;
  socialProfiles?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  
  // Module 2: Admission
  admission?: {
    admissionOpen?: boolean;
    applicationStartDate?: string;
    applicationEndDate?: string;
    admissionMode?: 'Merit' | 'Entrance' | 'Both';
    applicationFee?: string;
    admissionUrl?: string;
    requiredDocuments?: string[];
    admissionProcess?: string; // Rich Text
  };

  // Module 4: Facilities
  facilities?: (string | {
    title: string;
    icon: string;
    available: boolean;
  })[];

  // Module 7: Placement
  placement?: {
    placementAvailable?: boolean;
    placementRate?: string;
    highestPackage?: string;
    averagePackage?: string;
    recruiters?: string[];
    placementDescription?: string;
  };

  // SEO fields & Module 8: SEO Advanced
  seoTitle?: string;
  seoDescription?: string;
  seoContent?: string;
  faqs?: { question: string; answer: string }[];
  featureImage?: string; // Module 1
  tags?: string[];
  keywords?: string[];
  seoAdvanced?: {
    focusKeyword?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    robotsIndex?: boolean;
    schemaEnabled?: boolean;
  };

  // Module 10: Brochure / PDF
  brochure?: {
    pdfUrl?: string;
    title?: string;
    size?: string;
  };

  // Module 11: Analytics Counters
  metrics?: {
    views?: number;
    brochureDownloads?: number;
    callClicks?: number;
    websiteClicks?: number;
    admissionClicks?: number;
  };
  
  createdAt?: any;
  updatedAt?: any;
}

// -------------------------------------------------------------
// CORE CRUD OPERATIONS
// -------------------------------------------------------------

export const getTaxonomyNodesByTrack = async (track: TaxonomyTrack): Promise<TaxonomyNode[]> => {
  const q = query(collection(db, 'taxonomy_nodes'), where('track', '==', track));
  const snap = await getDocs(q);
  let nodes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode));
  
  // Merge hardcoded nodes
  nodes = [...nodes, ...hardcodedRegistry.getHardcodedTaxonomyNodesByTrack(track)];
  
  return nodes.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getTaxonomyNodeBySlug = async (fullSlug: string): Promise<TaxonomyNode | null> => {
  try {
    // Check hardcoded nodes first
    const parts = fullSlug.split('/');
    const slug = parts[parts.length - 1]; // Naive check for hardcoded node by slug
    const hardcodedNode = hardcodedRegistry.getHardcodedTaxonomyNodes().find(n => n.fullSlug === fullSlug || n.slug === slug);
    if (hardcodedNode) return hardcodedNode;

    const q = query(collection(db, 'taxonomy_nodes'), where('fullSlug', '==', fullSlug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() } as TaxonomyNode;
    }
    return null;
  } catch (error) {
    console.error("Error fetching taxonomy node by slug:", error);
    return null;
  }
};

export const getTaxonomyNodesByType = async (track: TaxonomyTrack, type: NodeType): Promise<TaxonomyNode[]> => {
  const q = query(collection(db, 'taxonomy_nodes'), where('track', '==', track), where('type', '==', type));
  const snap = await getDocs(q);
  let nodes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode));
  
  // Merge hardcoded nodes
  nodes = [...nodes, ...hardcodedRegistry.getHardcodedTaxonomyNodesByType(track, type)];
  
  return nodes.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getTaxonomyNodesByParent = async (parentId: string): Promise<TaxonomyNode[]> => {
  const q = query(collection(db, 'taxonomy_nodes'), where('parentId', '==', parentId));
  const snap = await getDocs(q);
  let nodes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode));
  
  // Merge hardcoded nodes
  nodes = [...nodes, ...hardcodedRegistry.getHardcodedTaxonomyNodesByParent(parentId)];
  
  return nodes.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getTaxonomyNodeById = async (id: string): Promise<TaxonomyNode | null> => {
  const hardcodedNode = hardcodedRegistry.getHardcodedTaxonomyNodeById(id);
  if (hardcodedNode) return hardcodedNode;

  const docSnap = await getDoc(doc(db, 'taxonomy_nodes', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as TaxonomyNode;
  }
  return null;
};

// CREATE
export const createTaxonomyNode = async (data: Omit<TaxonomyNode, 'id' | 'createdAt' | 'updatedAt' | 'orderIndex'>, idOverride?: string): Promise<string> => {
  const newRef = idOverride ? doc(db, 'taxonomy_nodes', idOverride) : doc(collection(db, 'taxonomy_nodes'));
  
  let finalData: any = { ...data };
  
  try {
    const { generateSlug } = await import('@/lib/seo/slug');
    const isValidSlug = (s?: string) => s && /^[a-z0-9-]+$/.test(s);
    const localSlug = isValidSlug(data.slug) ? data.slug! : generateSlug(data.title || newRef.id);
    finalData.slug = localSlug;

    if (data.parentId) {
      const parentDoc = await getDoc(doc(db, 'taxonomy_nodes', data.parentId));
      if (parentDoc.exists()) {
        const parent = parentDoc.data() as TaxonomyNode;
        const parentAncestors = parent.ancestors || [];
        const newAncestors = [...parentAncestors, {
          id: parentDoc.id,
          slug: parent.slug || generateSlug(parent.title || parentDoc.id),
          title: parent.title,
          type: parent.type
        }];
        finalData.ancestors = newAncestors;
        finalData.fullSlug = parent.fullSlug ? `${parent.fullSlug}/${localSlug}` : localSlug;
        
        newAncestors.forEach(a => {
          if (a.type === 'board') finalData.boardSlug = a.slug;
          if (a.type === 'class') finalData.classSlug = a.slug;
          if (a.type === 'subject') finalData.subjectSlug = a.slug;
          if (a.type === 'textbook') finalData.bookSlug = a.slug;
          if (a.type === 'chapter') finalData.chapterSlug = a.slug;
          if (a.type === 'topic') finalData.topicSlug = a.slug;
        });
      } else {
        finalData.fullSlug = localSlug;
      }
    } else {
      finalData.fullSlug = localSlug;
    }

    let schemaType = 'LearningResource';
    if (['board', 'class', 'subject'].includes(data.type)) schemaType = 'Course';
    else if (data.type === 'textbook') schemaType = 'Book';
    else if (data.type === 'chapter' || data.type === 'topic') schemaType = 'Article';
    finalData.schemaType = schemaType;
    
    if (finalData.isIndexable === undefined) {
      finalData.isIndexable = true;
    }
  } catch (e) {
    console.error("Failed to auto-generate SEO metadata:", e);
  }

  await setDoc(newRef, {
    ...finalData,
    orderIndex: Date.now(), // default simple ordering
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return newRef.id;
};

// UPDATE
export const updateTaxonomyNode = async (id: string, data: Partial<TaxonomyNode>) => {
  const docRef = doc(db, 'taxonomy_nodes', id);
  const existingDoc = await getDoc(docRef);
  
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });

  if (existingDoc.exists()) {
    const existingData = existingDoc.data() as TaxonomyNode;
    
    // Auto-rebuild SEO if title, slug, or parentId changed
    if ((data.title && data.title !== existingData.title) || 
        (data.slug && data.slug !== existingData.slug) ||
        (data.parentId !== undefined && data.parentId !== existingData.parentId)) {
      import('./migration').then(({ rebuildSubtreeSeo }) => {
        rebuildSubtreeSeo(id).catch(e => console.error("Failed to rebuild subtree SEO in background:", e));
      }).catch(e => console.error("Failed to import migration module:", e));
    }

    // Automatically sync updates to the new guide_* collections to prevent split-brain issues
    if (data.title) {
      const type = existingData.type;
      // Only sync if it's an academic node type that exists in guide_* collections
      if (['board', 'class', 'subject', 'textbook', 'chapter', 'topic'].includes(type)) {
        try {
          // Dynamic import to avoid circular dependencies if any
          const { updateGuideNodeTitle } = await import('./guide');
          await updateGuideNodeTitle(id, type, data.title, data.author);
        } catch (e) {
          console.error('Failed to sync to guide collections:', e);
        }
      }
    }
  }
};

export const updateTaxonomyNodeOrders = async (nodes: { id: string, orderIndex: number }[]) => {
  const promises = nodes.map(node => updateDoc(doc(db, 'taxonomy_nodes', node.id), { orderIndex: node.orderIndex }));
  await Promise.all(promises);
};

// DELETE (CASCADING)
export const deleteTaxonomyNode = async (id: string) => {
  // First, find all children where parentId == id
  const children = await getTaxonomyNodesByParent(id);
  
  // Recursively delete children
  for (const child of children) {
    await deleteTaxonomyNode(child.id);
  }

  // Delete the node itself
  await deleteDoc(doc(db, 'taxonomy_nodes', id));
};

// -------------------------------------------------------------
// HELPER FUNCTIONS FOR MIGRATION & UI
// -------------------------------------------------------------

export const generateSlug = (name: string) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\p{L}\p{N}\p{M}-]/gu, '') // Remove all non-word chars except letters, numbers, marks, and hyphens (Supports Bengali/Unicode)
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/(^-|-$)+/g, ''); // Trim - from start and end
};

// A helper to quickly map the old Guide types to new ones if needed, or get child types
export const getChildNodeType = (track: TaxonomyTrack, currentType: NodeType | 'root'): NodeType | null => {
  if (track === 'academic') {
    switch (currentType) {
      case 'root': return 'board';
      case 'board': return 'class';
      case 'class': return 'subject';
      case 'subject': return 'textbook';
      case 'textbook': return 'chapter';
      case 'chapter': return 'topic';
      case 'topic': return 'section';
      default: return null;
    }
  } else {
    switch (currentType) {
      case 'root': return 'category';
      case 'category': return 'subcategory';
      case 'subcategory': return 'exam';
      case 'exam': return 'subject';
      case 'subject': return 'chapter';
      case 'chapter': return 'topic';
      default: return null;
    }
  }
};
