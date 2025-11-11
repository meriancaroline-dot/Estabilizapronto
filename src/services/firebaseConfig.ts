// -------------------------------------------------------------
// src/services/firebaseConfig.ts
// -------------------------------------------------------------
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// 🔥 Credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBv8alNdfR_1gwpEMbZbW3_CvsWu90hBIE",
  authDomain: "estabiliza-20bf0.firebaseapp.com",
  projectId: "estabiliza-20bf0",
  storageBucket: "estabiliza-20bf0.firebasestorage.app",
  messagingSenderId: "695631479861",
  appId: "1:695631479861:web:15a06c4c6ac9dca8585d7c",
  measurementId: "G-R51WVFQ9NR",
};

// ✅ Inicializa Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// ✅ Auth
export const auth: Auth = getAuth(app);

// ✅ Firestore
export const db: Firestore = getFirestore(app);

export default app;
