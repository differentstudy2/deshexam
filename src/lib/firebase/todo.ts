import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './client';

export interface AdminTodo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  description?: string;
  dueDate?: Date | null;
  tags?: string[];
  createdAt?: any;
}

const COLLECTION_NAME = 'admin_todos';

// Fetch all todos once
export const fetchAdminTodos = async (): Promise<AdminTodo[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
      } as AdminTodo;
    });
  } catch (error) {
    console.error('Error fetching admin todos:', error);
    return [];
  }
};

// Listen to todos in real-time
export const subscribeToAdminTodos = (callback: (todos: AdminTodo[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const todos = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
      } as AdminTodo;
    });
    callback(todos);
  }, (error) => {
    console.error('Error subscribing to admin todos:', error);
  });
};

// Add a new todo
export const addAdminTodo = async (todo: Omit<AdminTodo, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...todo,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding admin todo:', error);
    throw error;
  }
};

// Update an existing todo
export const updateAdminTodo = async (id: string, updates: Partial<AdminTodo>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const dataToUpdate = { ...updates };
    // Don't update the ID field
    delete dataToUpdate.id;
    
    await updateDoc(docRef, dataToUpdate);
    return true;
  } catch (error) {
    console.error('Error updating admin todo:', error);
    throw error;
  }
};

// Delete a todo
export const deleteAdminTodo = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting admin todo:', error);
    throw error;
  }
};
