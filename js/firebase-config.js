// ============================================================
// firebase-config.js — Firebase initialization & config
// Replace the placeholder values with YOUR Firebase project config
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ⚠️  REPLACE THESE VALUES with your Firebase project credentials
// Go to: Firebase Console → Project Settings → Your Apps → Web App → Config
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfuph55PFH3SAiFBJqgxBwjF2IXgKVQVg",
  authDomain: "markethub-7191d.firebaseapp.com",
  projectId: "markethub-7191d",
  storageBucket: "markethub-7191d.firebasestorage.app",
  messagingSenderId: "799174761198",
  appId: "1:799174761198:web:f4656d8fa64dd6cc7c71ff",
  measurementId: "G-ZTLTM7FRCW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider to show account selection every time
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;
