import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGQg2VtqJNrL6NAihfnR6SOwY18lPn8YM",
  authDomain: "wad2g7t09.firebaseapp.com",
  projectId: "wad2g7t09",
  storageBucket: "wad2g7t09.appspot.com",
  messagingSenderId: "342958265365",
  appId: "1:342958265365:web:9fb8d8d1794a3ccb7c6a1c",
  measurementId: "G-9ZFXVK0JHG",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
getAnalytics(firebaseApp); // Pass the initialized Firebase app

// Create Vue app
const app = createApp(App);

app.use(router);
app.mount('#app');
