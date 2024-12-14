// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxih8idQqKjZXzNOc0jXFspvPeNg4Q9J8",
  authDomain: "pkm-collections.firebaseapp.com",
  projectId: "pkm-collections",
  storageBucket: "pkm-collections.firebasestorage.app",
  messagingSenderId: "514609490174",
  appId: "1:514609490174:web:4457c9fff9ab258c49ddaf",
  measurementId: "G-ZRE8QYB1CH",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
