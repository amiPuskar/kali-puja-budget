# Firebase Debug Guide

## "Failed to save member" Error - Troubleshooting Steps

### 1. Check Firebase Connection
Open browser console (F12) and look for these errors:
- `FirebaseError: Missing or insufficient permissions`
- `FirebaseError: The project does not exist`
- `FirebaseError: Permission denied`

### 2. Verify Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `puja-budget` project
3. Go to **Firestore Database**
4. Check if database exists and is in "test mode"

### 3. Check Firestore Security Rules
Go to **Firestore Database > Rules** and ensure you have:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For testing only
    }
  }
}
```

### 4. Test Firebase Connection
Add this to your browser console on any page:

```javascript
// Test Firebase connection
import { getFirestore } from 'firebase/firestore';
import { db } from './lib/firebaseConfig';

console.log('Firebase DB:', db);
console.log('Firebase connected:', !!db);
```

### 5. Check Network Tab
1. Open DevTools > Network tab
2. Try to add a member
3. Look for failed requests to `firestore.googleapis.com`
4. Check the error response

### 6. Common Issues & Solutions

#### Issue: "Permission denied"
**Solution:** Update Firestore rules to allow read/write

#### Issue: "Project does not exist"
**Solution:** Check your Firebase config in `lib/firebaseConfig.js`

#### Issue: "Missing API key"
**Solution:** Verify your `.env.local` file has correct values

#### Issue: "Network error"
**Solution:** Check internet connection and Firebase status

### 7. Quick Fix - Reset Firebase Rules
If nothing works, temporarily set rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING: This allows anyone to read/write your database. Only use for testing!**

### 8. Test Steps
1. Go to Members page
2. Click "Add Member"
3. Fill in the form
4. Click "Add Member"
5. Check browser console for specific error
6. Check Network tab for failed requests

### 9. If Still Failing
Try this test in browser console:

```javascript
// Test adding a document directly
import { collection, addDoc } from 'firebase/firestore';
import { db } from './lib/firebaseConfig';

addDoc(collection(db, 'test'), { test: 'data' })
  .then(doc => console.log('Success:', doc.id))
  .catch(err => console.error('Error:', err));
```

### 10. Contact Support
If all else fails, provide:
- Browser console error messages
- Network tab failed requests
- Your Firebase project ID
- Your current Firestore rules
