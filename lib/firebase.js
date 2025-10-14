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
import { getDocs, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { demoList, demoAdd, demoUpdate, demoDelete } from './demoData';

// Collections
export const COLLECTIONS = {
  MEMBERS: 'members',
  EXPENSES: 'expenses',
  VOLUNTEERS: 'volunteers',
  TASKS: 'tasks',
  INVENTORY: 'inventory',
  SPONSORS: 'sponsors',
  BUDGET: 'budget',
  EVENTS: 'events',
  PARTICIPANTS: 'participants',
  PRIZES: 'prizes',
  CLUBS: 'clubs',
  PUJAS: 'pujas'
};

// Generic CRUD operations
export const addDocument = async (collectionName, data) => {
  try {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') {
      return demoAdd(collectionName, data);
    }
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
    if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') {
      demoUpdate(collectionName, id, data);
      return;
    }
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
    if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') {
      demoDelete(collectionName, id);
      return;
    }
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error('Error deleting document: ', error);
    throw error;
  }
};

export const subscribeToCollection = (collectionName, callback) => {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') {
    callback(demoList(collectionName));
    const interval = setInterval(() => callback(demoList(collectionName)), 1000);
    return () => clearInterval(interval);
  }
  const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    callback(data);
  });
};

// Auth helpers
export const findClubByCredentials = async (email, password) => {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') {
    const list = demoList(COLLECTIONS.CLUBS);
    const match = list.find(c => c.email === email && c.password === password);
    return match || null;
  }
  const q = query(
    collection(db, COLLECTIONS.CLUBS),
    where('email', '==', email),
    where('password', '==', password)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() };
};

export const ensureDefaultClub = async () => {
  try {
    const existing = await getDocs(
      query(collection(db, COLLECTIONS.CLUBS), where('name', '==', 'Club One'))
    );
    if (!existing.empty) return existing.docs[0].id;
    const id = await addDocument(COLLECTIONS.CLUBS, {
      name: 'Club One',
      email: 'clubone@example.com',
      password: 'club123',
    });
    return id;
  } catch (err) {
    console.error('ensureDefaultClub failed', err);
    return null;
  }
};
