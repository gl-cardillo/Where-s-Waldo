import { initializeApp } from "firebase/app";
import {
  getFirestore,

} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDhzAv1h89jmwLiU-h9D66m5mhLCLWBMK8",
  authDomain: "find-them-3ab59.firebaseapp.com",
  projectId: "find-them-3ab59",
  storageBucket: "find-them-3ab59.appspot.com",
  messagingSenderId: "856913569777",
  appId: "1:856913569777:web:43bf2494f57c1f1bd58650"
};

initializeApp(firebaseConfig);

export const db = getFirestore();