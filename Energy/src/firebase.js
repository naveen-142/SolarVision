// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB574Dwlc5pdQGPlZHd3IgkUr7QuOYbi0k",
  authDomain: "solar-panel-ai-4ca22.firebaseapp.com",
  projectId: "solar-panel-ai-4ca22",
  storageBucket: "solar-panel-ai-4ca22.firebasestorage.app",
  messagingSenderId: "842697440524",
  appId: "1:842697440524:web:d792fbad71b612b16d5d29",
  measurementId: "G-5Y5NDFJVTN"
};

const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Firestore
export const db = getFirestore(app);

// Google Provider
export const googleProvider = new GoogleAuthProvider();
