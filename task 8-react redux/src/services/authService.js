import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './firebase.js'

function checkConfig() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Add your keys to .env.local.')
  }
}

export async function signUp(email, password) {
  checkConfig()
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function logIn(email, password) {
  checkConfig()
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function logInWithGoogle() {
  checkConfig()
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function logOut() {
  checkConfig()
  await signOut(auth)
}

// Firebase errors look like "auth/wrong-password", turn them into normal sentences
const MESSAGES = {
  'auth/invalid-email': 'This email address is not valid.',
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/user-not-found': 'There is no account with this email.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'The password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'auth/network-request-failed': 'No connection to the server. Check your internet.',
  'auth/popup-closed-by-user': 'The Google window was closed before signing in.',
  'auth/popup-blocked': 'The browser blocked the Google window. Allow pop-ups and try again.',
  'auth/unauthorized-domain': 'This website is not allowed in the Firebase settings yet.',
}

export function getAuthErrorMessage(error) {
  return MESSAGES[error.code] || error.message || 'Something went wrong. Please try again.'
}
