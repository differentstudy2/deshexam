import { db } from './client';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, serverTimestamp } from 'firebase/firestore';
import { Product } from '@/lib/types';

export const PRODUCTS_COLLECTION = 'products';

export async function getProducts(filters?: Record<string, any>, limitCount = 20, startAfterDoc?: any) {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  let conditions = [];
  
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'All' && value !== 'all') {
        conditions.push(where(key, '==', value));
      }
    }
  }

  let q;
  if (conditions.length > 0) {
    if (startAfterDoc) {
      q = query(colRef, ...conditions, startAfter(startAfterDoc), limit(limitCount));
    } else {
      q = query(colRef, ...conditions, limit(limitCount));
    }
  } else {
    if (startAfterDoc) {
      q = query(colRef, orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(limitCount));
    } else {
      q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
    }
  }
  
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
  
  return {
    products: results,
    lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
  };
}

export async function getProduct(id: string) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function createProduct(data: Omit<Product, 'createdAt' | 'updatedAt'>) {
  const docRef = doc(collection(db, PRODUCTS_COLLECTION));
  await setDoc(docRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function seedMockProducts(products: Partial<Product>[]) {
  for (const product of products) {
    const docRef = doc(collection(db, PRODUCTS_COLLECTION));
    await setDoc(docRef, { ...product, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}
