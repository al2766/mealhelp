
import { initializeApp } from "firebase/app";
import {  getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";





const firebaseConfig = {
  apiKey: "AIzaSyASVxACwYPtQ8ywA0Lz62fhAop-5HzKPMg",
  authDomain: "mealhelp-59d48.firebaseapp.com",
  projectId: "mealhelp-59d48",
  storageBucket: "mealhelp-59d48.appspot.com",
  messagingSenderId: "411491911540",
  appId: "1:411491911540:web:dcb02900d22be18cd38e21",
  measurementId: "G-5VQG56DH53"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
const db = getFirestore(app);

const auth = getAuth(app);
export { auth, app, db };