import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Collections
export const COLLECTIONS = {
  MEMBERS: 'members', // Club members (not puja-specific)
  PENDING_MEMBERS: 'pending_members', // Pending member registrations
  PUJAS: 'pujas', // Puja management data (shared across users)
  CONTRIBUTIONS: 'contributions', // Member contributions per puja
  EXPENSES: 'expenses',
  VOLUNTEERS: 'volunteers',
  TASKS: 'tasks',
  INVENTORY: 'inventory',
  SPONSORS: 'sponsors',
  BUDGET_ITEMS: 'budget_items', // Default budget items (not puja-specific)
  BUDGET_ALLOCATIONS: 'budget_allocations', // Puja-specific budget allocations
  EVENTS: 'events',
  PARTICIPANTS: 'participants',
  PRIZES: 'prizes'
};

// Generic CRUD operations
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
    throw error;
  }
};

export const updateDocument = async (collectionName, id, data) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating document: ', error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error('Error deleting document: ', error);
    throw error;
  }
};

export const subscribeToCollection = (collectionName, callback) => {
  // For pending_members, use requestedAt field, for others use createdAt
  const orderField = collectionName === 'pending_members' ? 'requestedAt' : 'createdAt';
  
  try {
    const q = query(collection(db, collectionName), orderBy(orderField, 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      console.log(`Firebase subscription for ${collectionName}:`, data.length, 'documents');
      callback(data);
    }, (error) => {
      console.error(`Firebase subscription error for ${collectionName}:`, error);
      // If ordering fails, try without ordering
      const fallbackQuery = collection(db, collectionName);
      return onSnapshot(fallbackQuery, (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        console.log(`Firebase fallback subscription for ${collectionName}:`, data.length, 'documents');
        callback(data);
      });
    });
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionName}:`, error);
    // Fallback: try without ordering
    const fallbackQuery = collection(db, collectionName);
    return onSnapshot(fallbackQuery, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      console.log(`Firebase fallback subscription for ${collectionName}:`, data.length, 'documents');
      callback(data);
    });
  }
};
