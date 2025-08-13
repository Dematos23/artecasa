import admin from 'firebase-admin';

// This is the Firebase Admin SDK, for use in server-side code (Next.js actions).
// It has privileged access to all data, bypassing security rules.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
  if (!serviceAccount) {
    throw new Error('Firebase service account key is not set in environment variables.');
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Add your databaseURL here if you have a Realtime Database
    // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
