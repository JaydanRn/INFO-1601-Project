import firebaseConfig from "./firebaseConfig.js"; 
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
 
const app = initializeApp(firebaseConfig);
const signUp = document.getElementById("submit");

signUp.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const username = document.getElementById("signup-username").value;

    const auth = getAuth(app);
    const db = getFirestore(app); // Initialize Firestore

    createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    const userData = {
      email: email,
      username: username,
      password: password, // Avoid storing plain passwords in production; use hashing instead
    };
    alert("User created successfully!");
    const docRef = doc(db, "Users", user.uid); // Use the user's UID as the document ID
    setDoc(docRef, userData); // Save user data to Firestore
    window.location.href = "login.html"; // Redirect to the login page
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert("Error creating user: " + errorMessage);
  });
})



/*
const submit = document.getElementById("submitSignUp");
const auth = getAuth(app); // Initialize Firebase Authentication
submit.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    alert("User created successfully!");
    window.location.href = "login.html"; // Redirect to the login page
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert("Error creating user: " + errorMessage);
    // ..
  });
})*/