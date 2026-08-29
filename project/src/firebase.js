// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDiZWS5DoxeyPkZajMY6MGZq59M9OVI9gI",
    authDomain: "project-1-b180f.firebaseapp.com",
    databaseURL: "https://project-1-b180f-default-rtdb.firebaseio.com",
    projectId: "project-1-b180f",
    storageBucket: "project-1-b180f.firebasestorage.app",
    messagingSenderId: "1021752148036",
    appId: "1:1021752148036:web:831afd8f28279d8a713c11",
    measurementId: "G-SGNXPWTWGL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);