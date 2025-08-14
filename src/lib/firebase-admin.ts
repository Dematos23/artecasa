
import admin from 'firebase-admin';

// This is the Firebase Admin SDK, for use in server-side code (Next.js actions).
// It has privileged access to all data, bypassing security rules.

if (!admin.apps.length) {
  try {
    // In managed environments (like Cloud Run where App Hosting runs),
    // the SDK automatically discovers service account credentials.
    // For local development, you must set up Application Default Credentials.
    // See: https://firebase.google.com/docs/admin/setup#initialize-sdk
    admin.initializeApp();
  } catch (e: any) {
    console.error(
      'Firebase Admin SDK initialization failed.',
      'Please ensure you have set up Application Default Credentials for local development.',
      'Original error:', e.message
    );
    // Re-throwing is important to prevent the app from running with a misconfigured SDK.
    throw new Error(
      `Firebase Admin SDK initialization failed: ${e.message}`
    );
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
