import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyCms_BovCYLgN5t1jtzH_BnaF8JVQPJdzU",
  authDomain: "sprinty-fyp.firebaseapp.com",
  projectId: "sprinty-fyp",
  storageBucket: "sprinty-fyp.appspot.com",
  messagingSenderId: "1058551987296",
  appId: "1:1058551987296:web:dc9c50e3f7cdc8a2621705",
  measurementId: "G-0CNG41VQZS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);

export { firestore, auth, database };