// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB4tt_e8coqWavThMUlLjBK9t8vpqUk7TY",
    authDomain: "native-notes-a456e.firebaseapp.com",
    projectId: "native-notes-a456e",
    storageBucket: "native-notes-a456e.firebasestorage.app",
    messagingSenderId: "640607827964",
    appId: "1:640607827964:web:aa2e9a76f22cf665ad2479",
    measurementId: "G-29X0J4E2QG"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);