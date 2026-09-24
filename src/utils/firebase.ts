import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Standard Client-side Firebase Configuration (Decoupled from AI Studio Platform Provisioning)
const firebaseClientConfig = {
  projectId: "gen-lang-client-0153215060",
  appId: "1:398759031444:web:72b5a936eec6e97e9c7a81",
  apiKey: "AIzaSyBHs_z05SsIC3j8d6FSy2jPusM36VQkKBs",
  authDomain: "gen-lang-client-0153215060.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-siaprevitasistem-cf707440-14f5-47c5-ab05-3e2afdeadb30",
  storageBucket: "gen-lang-client-0153215060.firebasestorage.app",
  messagingSenderId: "398759031444",
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseClientConfig) : getApp();

// Initialize Firestore
export const db = firebaseClientConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseClientConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or unreachable.');
    } else {
      console.info('Firestore client ready.');
    }
    return false;
  }
}

export default app;
