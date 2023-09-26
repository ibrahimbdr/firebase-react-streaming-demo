// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTbIxQmqNOkPVfwPbUc5GAvWOVW37PUyI",
  authDomain: "video-stream-demo-c4c20.firebaseapp.com",
  projectId: "video-stream-demo-c4c20",
  storageBucket: "video-stream-demo-c4c20.appspot.com",
  messagingSenderId: "250572019373",
  appId: "1:250572019373:web:8191e6821a03ad25051824"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
