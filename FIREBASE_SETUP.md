# Firebase Database Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `puja-budget` ✅ (Already created)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your region)
5. Click "Done"

## Step 3: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app with nickname: `puja-budget-web`
5. Copy the Firebase configuration object

## Step 4: Update Firebase Configuration

Replace the placeholder in `lib/firebaseConfig.js` with your actual Firebase config:

```javascript
// lib/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2pc12_g8N3HHlIdOUmpOUvQiZLcXH7XQ",
  authDomain: "puja-budget.firebaseapp.com",
  projectId: "puja-budget",
  storageBucket: "puja-budget.firebasestorage.app",
  messagingSenderId: "645683864923",
  appId: "1:645683864923:web:68acb8b8a62ef0b3e8e67e",
  measurementId: "G-Y39FE8PQ2V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

## Step 5: Set Up Environment Variables (Recommended)

1. Create `.env.local` file in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC2pc12_g8N3HHlIdOUmpOUvQiZLcXH7XQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=puja-budget.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=puja-budget
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=puja-budget.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=645683864923
NEXT_PUBLIC_FIREBASE_APP_ID=1:645683864923:web:68acb8b8a62ef0b3e8e67e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-Y39FE8PQ2V
```

2. Update `lib/firebaseConfig.js` to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
```

## Step 6: Set Up Firestore Security Rules

1. Go to Firestore Database > Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 7: Create Initial Collections

Your app will automatically create these collections when you start using it:

- `members` - Club members
- `contributions_{pujaId}` - Member contributions per puja
- `expenses_{pujaId}` - Expenses per puja
- `budget_items` - Default budget items
- `budget_allocations_{pujaId}` - Budget allocations per puja
- `volunteers_{pujaId}` - Volunteers per puja
- `tasks_{pujaId}` - Tasks per puja
- `inventory_{pujaId}` - Inventory items per puja
- `sponsors_{pujaId}` - Sponsors per puja
- `events_{pujaId}` - Cultural events per puja
- `participants_{pujaId}` - Event participants per puja
- `prizes_{pujaId}` - Event prizes per puja

## Step 8: Test Your Setup

1. Run your Next.js app: `npm run dev` ✅ (Already running)
2. Go to your app and try adding a member
3. Check Firestore Database to see if the data appears
4. If successful, your Firebase setup is complete!

## ✅ Your Firebase Setup Status

- **Project Created**: `puja-budget` ✅
- **Configuration Updated**: `lib/firebaseConfig.js` ✅
- **Environment File**: `.env.local` ✅
- **Development Server**: Running ✅

**Your Firebase project is ready to use!** 🎉

## Step 9: Production Security Rules (Optional)

For production, update your Firestore rules to be more restrictive:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Members collection - only admins can write
    match /members/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'super_admin');
    }
    
    // Puja-specific collections - only admins can write
    match /{collection}_{pujaId}/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'super_admin');
    }
    
    // Budget items - only admins can write
    match /budget_items/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'super_admin');
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Make sure you're only initializing Firebase once
   - Check if you have multiple Firebase config files

2. **"Permission denied"**
   - Check your Firestore security rules
   - Make sure you're authenticated (if using auth)

3. **"Collection doesn't exist"**
   - Collections are created automatically when you add the first document
   - This is normal behavior

4. **Environment variables not working**
   - Make sure your `.env.local` file is in the project root
   - Restart your development server after adding environment variables
   - Use `NEXT_PUBLIC_` prefix for client-side variables

### Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
