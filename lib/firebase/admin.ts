import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// Firebase Admin SDK configuration (server-side only)
let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

// Initialize Firebase Admin only once
if (!getApps().length) {
  // In production, you'll need to provide service account credentials
  // For now, using application default credentials or service account key
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    privateKey
  ) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } else {
    // Fallback: Use application default credentials (works on Cloud Run, App Engine, etc.)
    app = initializeApp({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });
  }

  adminDb = getFirestore(app);
  adminAuth = getAuth(app);
} else {
  app = getApps()[0];
  adminDb = getFirestore(app);
  adminAuth = getAuth(app);
}

export { app as adminApp, adminDb, adminAuth };
