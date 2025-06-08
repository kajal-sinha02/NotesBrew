// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCLTqRFYstRPtJQR7gv-6V0pXnKxXXIV8E",
  authDomain: "notes-sharing-90ca7.firebaseapp.com",
  projectId: "notes-sharing-90ca7",
  storageBucket: "notes-sharing-90ca7.appspot.com", // corrected .app to .com
  messagingSenderId: "833395877603",
  appId: "1:833395877603:web:07573f630c276f69fec7d6",
  measurementId: "G-MCE7KVZTJL"
};

// Initialize app (only once)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Init Firestore
const db = getFirestore(app);

export { db };