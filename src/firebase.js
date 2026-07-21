import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCko0AeT3hjwvGBlGydpJ-PjA445Txswxw",
  authDomain: "sleepy-frontend-eac65.firebaseapp.com",
  projectId: "sleepy-frontend-eac65",
  storageBucket: "sleepy-frontend-eac65.firebasestorage.app",
  messagingSenderId: "879033633345",
  appId: "1:879033633345:web:fa5301abec3324481914c0",
  measurementId: "G-TKLVT6ZXEJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
