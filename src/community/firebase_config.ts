/**
 * ANTWRE — Cloud Firestore Production Configuration & Client Initialization
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Repository: https://github.com/Nik-2208/AntWire
 * Portfolio:  https://nik-portfolio-lime.vercel.app/
 * LinkedIn:   https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/
 *
 * Provides real Cloud Firestore database connectivity for Community Hub, Feedback,
 * Developer Discussions, Model Hub, Bug Reports, and Verified Download Metrics.
 *
 * SAFETY INVARIANT: The core AntWire biological brain, 55k neural connectome,
 * and multi-agent simulation run 100% locally and NEVER fail if Cloud Firestore is offline.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from 'firebase/analytics';

function getEnv(key: string, fallback = ''): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const val = (import.meta as any).env[key];
    if (typeof val === 'string' && val.length > 0) return val;
  }
  if (typeof process !== 'undefined' && process.env) {
    const val = process.env[key];
    if (typeof val === 'string' && val.length > 0) return val;
  }
  return fallback;
}

/**
 * Official AntWire Firebase Web App Configuration
 * Project: ant-wire
 */
export const FIREBASE_CONFIG = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', ''),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'ant-wire.firebaseapp.com'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'ant-wire'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'ant-wire.firebasestorage.app'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '236018130196'),
  appId: getEnv('VITE_FIREBASE_APP_ID', '1:236018130196:web:ef292439ca61832784b601'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-QSG9FHZRTY'),
};

export class FirebaseBackendConfig {
  private static app: FirebaseApp | null = null;
  private static firestore: Firestore | null = null;
  private static auth: Auth | null = null;
  private static analytics: Analytics | null = null;
  private static googleProvider: GoogleAuthProvider | null = null;
  private static initialized = false;
  private static initError: string | null = null;

  /**
   * Initializes Cloud Firestore and Firebase Auth defensively with zero crash risk.
   */
  public static initialize(): boolean {
    if (this.initialized) return true;

    if (!FIREBASE_CONFIG.apiKey) {
      this.initError = 'VITE_FIREBASE_API_KEY not configured. Running in offline/local-first mode.';
      this.initialized = false;
      return false;
    }

    try {
      if (getApps().length === 0) {
        this.app = initializeApp(FIREBASE_CONFIG);
      } else {
        this.app = getApp();
      }

      // Initialize Cloud Firestore
      try {
        this.firestore = getFirestore(this.app);
      } catch (dbErr) {
        console.warn('[AntWire Firestore] Cloud Firestore init notice:', dbErr);
      }

      // Initialize Authentication
      try {
        this.auth = getAuth(this.app);
        this.googleProvider = new GoogleAuthProvider();
        this.googleProvider.setCustomParameters({ prompt: 'select_account' });
      } catch (authErr) {
        console.warn('[AntWire Firebase] Auth init notice:', authErr);
      }

      // Initialize Analytics (optional, browser-only)
      if (typeof window !== 'undefined') {
        isAnalyticsSupported().then((supported) => {
          if (supported && this.app) {
            try {
              this.analytics = getAnalytics(this.app);
            } catch {
              // Analytics optional
            }
          }
        }).catch(() => {
          // Ignore analytics support errors
        });
      }

      this.initialized = true;
      this.initError = null;
      return true;
    } catch (err: any) {
      console.warn('[AntWire Firebase] Initialization exception (running offline mode):', err?.message || err);
      this.initError = err?.message || 'Firebase initialization failed';
      this.initialized = false;
      return false;
    }
  }

  public static getApp(): FirebaseApp | null {
    if (!this.initialized) this.initialize();
    return this.app;
  }

  public static getFirestoreDb(): Firestore | null {
    if (!this.initialized) this.initialize();
    return this.firestore;
  }

  public static getDb(): Firestore | null {
    return this.getFirestoreDb();
  }

  public static getAuth(): Auth | null {
    if (!this.initialized) this.initialize();
    return this.auth;
  }

  public static getGoogleProvider(): GoogleAuthProvider | null {
    if (!this.initialized) this.initialize();
    return this.googleProvider;
  }

  public static getAnalytics(): Analytics | null {
    return this.analytics;
  }

  public static isOnline(): boolean {
    return this.initialized && this.firestore !== null;
  }

  public static getInitError(): string | null {
    return this.initError;
  }
}
