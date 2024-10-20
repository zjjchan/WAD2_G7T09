import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBGQg2VtqJNrL6NAihfnR6SOwY18lPn8YM",
    authDomain: "wad2g7t09.firebaseapp.com",
    projectId: "wad2g7t09",
    storageBucket: "wad2g7t09.appspot.com",
    messagingSenderId: "342958265365",
    appId: "1:342958265365:web:9fb8d8d1794a3ccb7c6a1c",
    measurementId: "G-9ZFXVK0JHG"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };