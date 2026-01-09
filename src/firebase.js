import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration du projet "Ville de France"
const firebaseConfig = {
    apiKey: "AIzaSyDn39CoIY2Qg0Ny0rSwy9pcHRUJG_TObe8",
    authDomain: "ville-de-france-c02ca.firebaseapp.com",
    projectId: "ville-de-france-c02ca",
    storageBucket: "ville-de-france-c02ca.firebasestorage.app",
    messagingSenderId: "348774196944",
    appId: "1:348774196944:web:970d07c3259cc37ba260d5",
    measurementId: "G-KBB4YSNWKT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
