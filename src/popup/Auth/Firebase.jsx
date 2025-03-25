import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Complete Firebase configuration from your Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyCms_BovCYLgN5t1jtzH_BnaF8JVQPJdzU",
  authDomain: "sprinty-fyp.firebaseapp.com",
  databaseURL: "https://sprinty-fyp-default-rtdb.firebaseio.com",
  projectId: "sprinty-fyp",
  storageBucket: "sprinty-fyp.firebasestorage.app",
  messagingSenderId: "1058551987296",
  appId: "1:1058551987296:web:dc9c50e3f7cdc8a2621705",
  measurementId: "G-0CNG41VQZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Extension-specific configuration
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  console.log("Running in Chrome Extension environment - applying special auth settings");
  
  // Set persistence to LOCAL for extensions
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("Set persistence to LOCAL for extension context");
    })
    .catch((error) => {
      console.error("Error setting persistence:", error);
    });
}

const firestore = getFirestore(app);
const database = getDatabase(app);

export { firestore, auth, database };