import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// if .env.local is missing the app still opens, the auth pages just show a warning
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey)

export const auth = isFirebaseConfigured ? getAuth(initializeApp(firebaseConfig)) : null
export const googleProvider = new GoogleAuthProvider()

// keep the user logged in after a refresh or closing the browser
if (auth) {
  setPersistence(auth, browserLocalPersistence)
}
