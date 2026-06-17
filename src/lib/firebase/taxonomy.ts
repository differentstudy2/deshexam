import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc, serverTimestamp, updateDoc, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type TaxonomyTrack = 'academic' | 'competitive';
export type AcademicNodeType = 'board' | 'institution' | 'class' | 'subject' | 'textbook' | 'chapter' | 'topic' | 'section';
export type CompetitiveNodeType = 'category' | 'subcategory' | 'exam' | 'subject' | 'chapter' | 'topic';
export type NodeType = AcademicNodeType | CompetitiveNodeType;

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
  
  // Optional fields used by specific node types
  icon?: string;
  description?: string;
  author?: string;
  
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
    authorName: string;
    rating: number;
    text: string;
    time: string;
    authorPhotoUrl: string;
  }[];
  
  // SEO fields
  seoTitle?: string;
  featureImage?: string;
  tags?: string[];
  keywords?: string[];
  
  createdAt?: any;
  updatedAt?: any;
}

// -------------------------------------------------------------
// CORE CRUD OPERATIONS
// -------------------------------------------------------------

export const getTaxonomyNodesByTrack = async (track: TaxonomyTrack): Promise<TaxonomyNode[]> => {
  const q = query(collection(db, 'taxonomy_nodes'), where('track', '==', track));
  const snap = await getDocs(q);
  const nodes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode));
  return nodes.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getTaxonomyNodesByType = async (track: TaxonomyTrack, type: NodeType): Promise<TaxonomyNode[]> => {
  const q = query(collection(db, 'taxonomy_nodes'), where('track', '==', track), where('type', '==', type));
  const snap = await getDocs(q);
  const nodes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode));
  return nodes.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getTaxonomyNodesByParent = async (parentId: string): Promise<TaxonomyNode[]> => {
  const q = query(collection(db, 'taxonomy_nodes'), where('parentId', '==', parentId));
  const snap = await getDocs(q);
  const nodes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode));
  return nodes.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

export const getTaxonomyNodeById = async (id: string): Promise<TaxonomyNode | null> => {
  const docSnap = await getDoc(doc(db, 'taxonomy_nodes', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as TaxonomyNode;
  }
  return null;
};

// CREATE
export const createTaxonomyNode = async (data: Omit<TaxonomyNode, 'id' | 'createdAt' | 'updatedAt' | 'orderIndex'>, idOverride?: string): Promise<string> => {
  const newRef = idOverride ? doc(db, 'taxonomy_nodes', idOverride) : doc(collection(db, 'taxonomy_nodes'));
  await setDoc(newRef, {
    ...data,
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

  // Automatically sync updates to the new guide_* collections to prevent split-brain issues
  if (existingDoc.exists() && data.title) {
    const type = existingDoc.data().type;
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
