
const firebaseConfig = {
  apiKey: "AIzaSyDZhaEnR2i4iNaCSqJY1hcRyYyd3sGhNLQ",
  authDomain: "az-innotech.firebaseapp.com",
  projectId: "az-innotech",
  storageBucket: "az-innotech.firebasestorage.app",
  messagingSenderId: "3361249503",
  appId: "1:3361249503:web:17775b7771af3755d8f16a",
  measurementId: "G-GL4W0FVNZ9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
