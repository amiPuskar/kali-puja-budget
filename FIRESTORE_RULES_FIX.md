# Fix: "Missing or insufficient permissions" Error

## Quick Fix - Update Firestore Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your `puja-budget` project
3. Click on **"Firestore Database"** in the left sidebar

### Step 2: Update Security Rules
1. Click on the **"Rules"** tab
2. Replace the existing rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Publish Rules
1. Click **"Publish"** button
2. Confirm the changes

### Step 4: Test
1. Go back to your app
2. Try adding a member again
3. It should work now!

## ⚠️ Security Warning

The above rules allow **anyone** to read/write your database. This is only for **development/testing**.

## Production Rules (Use Later)

When you're ready for production, replace with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Members collection - only authenticated users can read, admins can write
    match /members/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'super_admin');
    }
    
    // Puja-specific collections - only authenticated users can read, admins can write
    match /{collection}_{pujaId}/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'super_admin');
    }
    
    // Budget items - only authenticated users can read, admins can write
    match /budget_items/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'super_admin');
    }
  }
}
```

## Alternative: Check Current Rules

If you want to see your current rules first:
1. Go to **Firestore Database > Rules**
2. Copy the current rules
3. The issue is likely that rules are too restrictive or don't exist

## Why This Happened

- Firestore has security rules that prevent unauthorized access
- By default, new Firestore databases have restrictive rules
- Your app needs permission to read/write data
- The test mode rules allow all access for development

## Next Steps

1. **Immediate**: Use the test rules above to fix the error
2. **Later**: Implement proper authentication and use production rules
3. **Security**: Never use `allow read, write: if true` in production!
