import admin from 'firebase-admin';

// This is the Firebase Admin SDK, for use in server-side code (Next.js actions).
// It has privileged access to all data, bypassing security rules.

if (!admin.apps.length) {
  try {
    // Attempt to initialize with default credentials (for managed environments)
    admin.initializeApp();
  } catch (e: any) {
    // Fallback to service account key for local development
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (!serviceAccount) {
      console.error(
        'Firebase Admin SDK initialization failed. Neither default credentials nor a service account key were found.'
      );
      // Re-throwing the original error is often better than a generic one.
      throw new Error(
        `Failed to initialize Firebase Admin SDK. Original error: ${e.message}. Ensure default credentials are available or FIREBASE_SERVICE_ACCOUNT_KEY is set.`
      );
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
