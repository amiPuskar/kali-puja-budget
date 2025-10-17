// Test Firebase connection
// Run this in browser console to test Firebase

import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { db } from './lib/firebaseConfig';

console.log('Testing Firebase connection...');
console.log('DB instance:', db);

// Test adding a document
try {
  const docRef = await addDoc(collection(db, 'test'), {
    test: 'data',
    timestamp: new Date().toISOString()
  });
  console.log('✅ SUCCESS: Document written with ID:', docRef.id);
} catch (error) {
  console.error('❌ ERROR:', error);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
}
