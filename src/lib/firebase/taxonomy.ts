import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc, serverTimestamp, updateDoc, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type TaxonomyTrack = 'academic' | 'competitive';
export type AcademicNodeType = 'board' | 'class' | 'subject' | 'textbook' | 'chapter' | 'topic' | 'section';
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
  orderIndex: number;
  status: 'active' | 'inactive' | 'published' | 'draft';
  
  // Optional fields used by specific node types
  icon?: string;
  description?: string;
  author?: string;
  
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
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
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
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
